import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { type Job } from 'bullmq';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AttachmentTokenService } from '../ideas/attachment-token.service';
import {
  DEFAULT_FRONTEND_URL,
  MAIL_SUBJECTS,
  NOTIFICATION_QUEUE,
  NOTIFICATION_TYPES,
  WORKER_OPTIONS_UPSTASH,
} from './constants';
import {
  notificationJobPayloadSchema,
  type IdeaCreatedPayload,
  type IdeaDeletedPayload,
  type CommentCreatedPayload,
  type CommentRepliedPayload,
} from './schemas/queue-payload.schema';
import { maskEmailForLog } from './utils/pii-mask.util';

@Processor(NOTIFICATION_QUEUE, WORKER_OPTIONS_UPSTASH)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  private readonly isProduction: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
    private readonly attachmentToken: AttachmentTokenService,
  ) {
    super();
    this.isProduction = this.config.get<string>('NODE_ENV') === 'production';
  }

  async process(job: Job<unknown>): Promise<void> {
    const parseResult = notificationJobPayloadSchema.safeParse(job.data);
    if (!parseResult.success) {
      this.logger.warn(
        `Invalid job payload: ${parseResult.error.message}. Job ${job.id} skipped.`,
      );
      return;
    }

    const payload = parseResult.data;

    if (payload.type === 'idea.created') {
      await this.handleIdeaCreated(payload);
    } else if (payload.type === 'idea.deleted') {
      await this.handleIdeaDeleted(payload);
    } else if (payload.type === 'comment.created') {
      await this.handleCommentCreated(payload);
    } else {
      await this.handleCommentReplied(payload);
    }
  }

  private async handleIdeaCreated(payload: IdeaCreatedPayload): Promise<void> {
    const {
      ideaId,
      ideaTitle,
      departmentId,
      departmentName,
      submitterDisplayName,
      submitterEmail,
      isAnonymous = true,
      attachmentLinks = [],
    } = payload;

    const qaCoordinators = await this.prisma.user.findMany({
      where: {
        role: { name: 'QA_COORDINATOR' },
        departmentId,
        isActive: true,
      },
      select: { id: true, email: true },
    });

    if (qaCoordinators.length === 0) {
      this.logger.debug(
        `No QA Coordinator for department ${departmentId}, skipping notifications.`,
      );
      return;
    }

    const ideaLink = this.buildIdeaLink(ideaId);
    const message = `A new idea "${ideaTitle}" from ${submitterDisplayName} needs your review.`;

    const INLINE_MIME_PREFIXES = [
      'application/pdf',
      'image/',
      'text/plain',
      'text/html',
      'text/csv',
    ];
    const attachmentLinksWithUrls = attachmentLinks.map((att) => {
      const isInline =
        att.mimeType &&
        INLINE_MIME_PREFIXES.some((p) => att.mimeType!.startsWith(p));
      const token = this.attachmentToken.sign({
        sub: att.attachmentId,
        disp: isInline ? 'inline' : 'attachment',
      });
      return {
        fileName: att.fileName,
        secureUrl: this.buildAttachmentSignedUrl(token),
      };
    });

    const context = {
      ideaTitle,
      submitterDisplayName,
      submitterEmail: isAnonymous ? undefined : submitterEmail,
      isAnonymous,
      departmentName: departmentName ?? undefined,
      ideaLink,
      hasAttachments: attachmentLinks.length > 0,
      attachmentLinks: attachmentLinksWithUrls,
    };

    const results = await Promise.allSettled(
      qaCoordinators.map((coordinator) =>
        this.sendEmailAndCreateNotification({
          to: coordinator.email,
          userId: coordinator.id,
          subject: MAIL_SUBJECTS.IDEA_SUBMITTED,
          template: 'new-idea',
          context,
          message,
          link: ideaLink,
          type: NOTIFICATION_TYPES.IDEA_SUBMITTED,
          label: 'Idea submitted',
        }),
      ),
    );

    this.logResults(
      results,
      qaCoordinators.map((c) => c.email),
      'idea',
    );
  }

  private async handleIdeaDeleted(payload: IdeaDeletedPayload): Promise<void> {
    const { recipientUserId, ideaTitle } = payload;

    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientUserId, isActive: true },
      select: { id: true, email: true },
    });

    if (!recipient) return;

    const ideasLink = this.buildIdeasHubLink();
    const message = `Your proposal "${ideaTitle}" was removed by QA Manager.`;

    try {
      await this.sendEmailAndCreateNotification({
        to: recipient.email,
        userId: recipient.id,
        subject: MAIL_SUBJECTS.IDEA_DELETED,
        template: 'idea-deleted',
        context: {
          ideaTitle,
          ideasLink,
        },
        message,
        link: ideasLink,
        type: NOTIFICATION_TYPES.IDEA_DELETED,
        label: 'Idea deleted',
      });
    } catch (err) {
      this.logger.error(
        `Failed to send idea-deleted notification: ${err instanceof Error ? err.message : String(err)}`,
        { recipientId: recipient.id },
      );
    }
  }

  private buildAttachmentSignedUrl(token: string): string {
    const apiBase =
      this.config.get<string>('API_BASE_URL') ??
      `http://localhost:${this.config.get<number>('PORT') ?? 8001}`;
    const prefix = this.config.get<string>('API_PREFIX') ?? 'api';
    const version = this.config.get<string>('API_VERSION') ?? '1';
    return `${apiBase.replace(/\/$/, '')}/${prefix}/v${version}/ideas/attachments/signed/${token}`;
  }

  private buildIdeasHubLink(): string {
    const base =
      this.config.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL;
    return `${base.replace(/\/$/, '')}/ideas`;
  }

  private async handleCommentCreated(
    payload: CommentCreatedPayload,
  ): Promise<void> {
    const {
      ideaId,
      ideaTitle,
      commentId,
      recipientUserId,
      commenterDisplayName,
      commenterEmail,
      isAnonymous = false,
    } = payload;

    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientUserId, isActive: true },
      select: { id: true, email: true },
    });

    if (!recipient) return;

    const ideaLink = this.buildIdeaLink(ideaId, commentId);
    const displayName = isAnonymous ? 'Anonymous' : commenterDisplayName;
    const message = `${displayName} commented on your idea "${ideaTitle}".`;

    try {
      await this.sendEmailAndCreateNotification({
        to: recipient.email,
        userId: recipient.id,
        subject: MAIL_SUBJECTS.COMMENT_ADDED,
        template: 'new-comment',
        context: {
          ideaTitle,
          commenterDisplayName,
          commenterEmail: isAnonymous ? undefined : commenterEmail,
          ideaLink,
          isAnonymous,
        },
        message,
        link: ideaLink,
        type: NOTIFICATION_TYPES.COMMENT_ADDED,
        label: 'Comment added',
      });
    } catch (err) {
      this.logger.error(
        `Failed to send comment notification: ${err instanceof Error ? err.message : String(err)}`,
        { recipientId: recipient.id },
      );
    }
  }

  private async handleCommentReplied(
    payload: CommentRepliedPayload,
  ): Promise<void> {
    const {
      ideaId,
      ideaTitle,
      commentId,
      recipientUserId,
      replierDisplayName,
      replierEmail,
      isAnonymous = false,
    } = payload;

    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientUserId, isActive: true },
      select: { id: true, email: true },
    });

    if (!recipient) return;

    const ideaLink = this.buildIdeaLink(ideaId, commentId);
    const displayName = isAnonymous ? 'Anonymous' : replierDisplayName;
    const message = `${displayName} replied to your comment on "${ideaTitle}".`;

    try {
      await this.sendEmailAndCreateNotification({
        to: recipient.email,
        userId: recipient.id,
        subject: MAIL_SUBJECTS.COMMENT_REPLIED,
        template: 'new-reply',
        context: {
          ideaTitle,
          replierDisplayName,
          replierEmail: isAnonymous ? undefined : replierEmail,
          ideaLink,
          isAnonymous,
        },
        message,
        link: ideaLink,
        type: NOTIFICATION_TYPES.COMMENT_REPLIED,
        label: 'Comment replied',
      });
    } catch (err) {
      this.logger.error(
        `Failed to send reply notification: ${err instanceof Error ? err.message : String(err)}`,
        { recipientId: recipient.id },
      );
    }
  }

  private async sendEmailAndCreateNotification<
    T extends Record<string, unknown>,
  >(params: {
    to: string;
    userId: string;
    subject: string;
    template: string;
    context: T;
    message: string;
    link: string;
    type: string;
    label: string;
  }): Promise<void> {
    const {
      to,
      userId,
      subject,
      template,
      context,
      message,
      link,
      type,
      label,
    } = params;

    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });

    await this.prisma.notification.create({
      data: { userId, type, message, link },
    });

    this.logMailSent(label, to);
  }

  private logResults(
    results: PromiseSettledResult<void>[],
    emails: string[],
    type: string,
  ): void {
    const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
    const rejected = results.filter((r) => r.status === 'rejected').length;

    if (rejected > 0) {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const email = emails[i] ?? 'unknown';
          this.logger.error(
            `Failed to send ${type} notification: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`,
            { recipient: maskEmailForLog(email, this.isProduction) },
          );
        }
      });
    }

    if (fulfilled > 0) {
      this.logger.debug(
        `Notification ${type}: ${fulfilled} sent${rejected > 0 ? `, ${rejected} failed` : ''}`,
      );
    }
  }

  private buildIdeaLink(ideaId: string, commentId?: string): string {
    const base =
      this.config.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL;
    const path = `${base.replace(/\/$/, '')}/ideas/${ideaId}`;
    return commentId ? `${path}#comment-${commentId}` : path;
  }

  private logMailSent(label: string, to: string): void {
    if (this.isProduction) return;

    const inboxUrl = this.config.get<string>('MAILTRAP_INBOX_URL');
    const suffix = inboxUrl ? ` | View at: ${inboxUrl}` : '';
    this.logger.log(`[Mail] ${label} → ${to}${suffix}`);
  }
}
