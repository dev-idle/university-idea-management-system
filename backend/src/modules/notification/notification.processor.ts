import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { type Job } from 'bullmq';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  DEFAULT_FRONTEND_URL,
  DEFAULT_MAILTRAP_URL,
  MAIL_SUBJECTS,
  NOTIFICATION_QUEUE,
  NOTIFICATION_TYPES,
} from './constants';
import {
  notificationJobPayloadSchema,
  type IdeaCreatedPayload,
  type CommentCreatedPayload,
} from './schemas/queue-payload.schema';
import { maskEmailForLog } from './utils/pii-mask.util';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  private readonly isProduction: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {
    super();
    this.isProduction =
      this.config.get<string>('NODE_ENV') === 'production';
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
    } else {
      await this.handleCommentCreated(payload);
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
    const context = {
      ideaTitle,
      submitterDisplayName,
      submitterEmail: isAnonymous ? undefined : submitterEmail,
      isAnonymous,
      departmentName: departmentName ?? undefined,
      ideaLink,
      hasAttachments: attachmentLinks.length > 0,
      attachmentLinks,
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

    this.logResults(results, qaCoordinators.map((c) => c.email), 'idea');
  }

  private async handleCommentCreated(
    payload: CommentCreatedPayload,
  ): Promise<void> {
    const {
      ideaId,
      ideaTitle,
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

    const ideaLink = this.buildIdeaLink(ideaId);
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

  private async sendEmailAndCreateNotification<T extends Record<string, unknown>>(params: {
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

    this.logMailtrapUrl(label, to);
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

  private buildIdeaLink(ideaId: string): string {
    const base =
      this.config.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL;
    return `${base.replace(/\/$/, '')}/ideas/${ideaId}`;
  }

  private logMailtrapUrl(label: string, to: string): void {
    if (this.isProduction) return;

    const url =
      this.config.get<string>('MAILTRAP_INBOX_URL') ?? DEFAULT_MAILTRAP_URL;
    this.logger.log(
      `[Mail] ${label} → ${to} | View at: ${url}`,
    );
  }
}
