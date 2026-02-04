import * as crypto from 'node:crypto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import type { CreateIdeaBody } from './dto/create-idea.dto';
import type { VoteIdeaBody } from './dto/vote-idea.dto';
import type { CreateCommentBody } from './dto/create-comment.dto';

const STATUS_ACTIVE = 'ACTIVE';
const CLOUDINARY_UPLOAD_FOLDER = 'idea-attachments';

@Injectable()
export class IdeasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * Get the ACTIVE submission cycle for the currently active academic year, if any.
   */
  private async getActiveCycle() {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) return null;
    const cycle = await this.prisma.ideaSubmissionCycle.findFirst({
      where: { status: STATUS_ACTIVE, academicYearId: activeYear.id },
      select: {
        id: true,
        ideaSubmissionClosesAt: true,
        academicYearId: true,
      },
    });
    return cycle;
  }

  /**
   * Get the currently active academic year (id + name) for display in Staff UI.
   */
  private async getActiveAcademicYear() {
    const year = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true, name: true },
    });
    return year;
  }

  /**
   * Context for the Ideas Hub: can submit, active cycle info, categories for the cycle, active academic year.
   */
  async getContext(userId: string) {
    const activeYear = await this.getActiveAcademicYear();
    const cycle = activeYear
      ? await this.prisma.ideaSubmissionCycle.findFirst({
          where: { status: STATUS_ACTIVE, academicYearId: activeYear.id },
          select: {
            id: true,
            ideaSubmissionClosesAt: true,
            academicYearId: true,
          },
        })
      : null;
    const now = new Date();
    const canSubmit =
      !!cycle && cycle.ideaSubmissionClosesAt > now;

    let categories: Array<{ id: string; name: string }> = [];
    if (cycle) {
      const cycleCategories = await this.prisma.cycleCategory.findMany({
        where: { cycleId: cycle.id },
        select: { category: { select: { id: true, name: true } } },
      });
      categories = cycleCategories.map((cc) => cc.category);
    }

    return {
      canSubmit,
      activeCycleId: cycle?.id ?? null,
      submissionClosesAt: cycle?.ideaSubmissionClosesAt ?? null,
      activeAcademicYear: activeYear ? { id: activeYear.id, name: activeYear.name } : null,
      categories,
    };
  }

  /** Map DB idea to API shape (author hidden when anonymous). Includes voteCounts, myVote, commentCount when provided. */
  private mapIdeaToResponse(
    idea: {
      id: string;
      title: string;
      description: string | null;
      isAnonymous: boolean;
      createdAt: Date;
      categoryId: string | null;
      category: { id: string; name: string } | null;
      cycleId: string | null;
      submittedById: string | null;
      submittedBy: { id: string; fullName: string | null; email: string } | null;
      attachments: Array<{
        id: string;
        fileName: string;
        secureUrl: string;
        mimeType: string | null;
        sizeBytes: number | null;
      }>;
      votes?: Array< { value: string; userId: string } >;
      _count?: { comments: number };
    },
    userId?: string,
  ) {
    let voteCounts = { up: 0, down: 0 };
    let myVote: 'up' | 'down' | null = null;
    if (idea.votes) {
      for (const v of idea.votes) {
        if (v.value === 'up') voteCounts.up += 1;
        else if (v.value === 'down') voteCounts.down += 1;
        if (userId && v.userId === userId) myVote = v.value as 'up' | 'down';
      }
    }
    return {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      isAnonymous: idea.isAnonymous,
      createdAt: idea.createdAt,
      categoryId: idea.categoryId,
      category: idea.category,
      cycleId: idea.cycleId,
      author: idea.isAnonymous
        ? null
        : idea.submittedBy
          ? {
              id: idea.submittedBy.id,
              fullName: idea.submittedBy.fullName,
              email: idea.submittedBy.email,
            }
          : null,
      attachments: idea.attachments,
      voteCounts,
      myVote,
      commentCount: idea._count?.comments ?? 0,
    };
  }

  /**
   * List ideas with pagination and sort.
   * - When there is an ACTIVE cycle: only ideas within that cycle.
   * - When there is no active cycle: all ideas for the active academic year (all cycles).
   * Sort: latest (default), mostPopular, mostViewed (latter two currently same as latest until votes/views exist).
   * Author is hidden when idea.isAnonymous. Optional userId for myVote.
   */
  async findAllForActiveYear(params: {
    page?: number;
    limit?: number;
    sort?: 'latest' | 'mostPopular' | 'mostViewed';
    userId?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 10));
    const sort = params.sort ?? 'latest';

    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) return { items: [], total: 0 };

    const activeCycle = await this.prisma.ideaSubmissionCycle.findFirst({
      where: { status: STATUS_ACTIVE, academicYearId: activeYear.id },
      select: { id: true },
    });

    const cycleIds = activeCycle
      ? [activeCycle.id]
      : (
          await this.prisma.ideaSubmissionCycle.findMany({
            where: { academicYearId: activeYear.id },
            select: { id: true },
          })
        ).map((c) => c.id);
    if (cycleIds.length === 0) return { items: [], total: 0 };

    const orderBy = { createdAt: 'desc' as const };

    const userId = params.userId;
    const [items, total] = await Promise.all([
      this.prisma.idea.findMany({
        where: { cycleId: { in: cycleIds } },
        select: {
          id: true,
          title: true,
          description: true,
          isAnonymous: true,
          createdAt: true,
          categoryId: true,
          category: { select: { id: true, name: true } },
          cycleId: true,
          submittedById: true,
          submittedBy: { select: { id: true, fullName: true, email: true } },
          attachments: {
            select: {
              id: true,
              fileName: true,
              secureUrl: true,
              mimeType: true,
              sizeBytes: true,
            },
          },
          votes: { select: { value: true, userId: true } },
          _count: { select: { comments: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.idea.count({ where: { cycleId: { in: cycleIds } } }),
    ]);

    return {
      items: items.map((idea) => this.mapIdeaToResponse(idea, userId)),
      total,
    };
  }

  /**
   * Get a single idea by id. Must belong to a cycle in the currently active academic year.
   * Author is hidden when idea.isAnonymous. Optional userId for myVote. Returns interactionClosesAt for the idea's cycle.
   */
  async findOne(id: string, userId?: string) {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) throw new NotFoundException('Idea not found.');

    const cycleIds = (
      await this.prisma.ideaSubmissionCycle.findMany({
        where: { academicYearId: activeYear.id },
        select: { id: true },
      })
    ).map((c) => c.id);
    if (cycleIds.length === 0) throw new NotFoundException('Idea not found.');

    const idea = await this.prisma.idea.findFirst({
      where: { id, cycleId: { in: cycleIds } },
      select: {
        id: true,
        title: true,
        description: true,
        isAnonymous: true,
        createdAt: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
        cycleId: true,
        submittedById: true,
        submittedBy: { select: { id: true, fullName: true, email: true } },
        attachments: {
          select: {
            id: true,
            fileName: true,
            secureUrl: true,
            mimeType: true,
            sizeBytes: true,
          },
        },
        votes: { select: { value: true, userId: true } },
        cycle: { select: { interactionClosesAt: true } },
      },
    });
    if (!idea) throw new NotFoundException('Idea not found.');
    const mapped = this.mapIdeaToResponse(idea, userId);
    return {
      ...mapped,
      interactionClosesAt: idea.cycle?.interactionClosesAt ?? null,
    };
  }

  /**
   * Ensure idea exists in active academic year and return its cycle's interactionClosesAt.
   * Throws NotFoundException if idea not found; BadRequestException if interaction window is closed.
   */
  private async ensureIdeaInActiveYearAndInteractionOpen(ideaId: string): Promise<Date> {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) throw new NotFoundException('Idea not found.');

    const cycleIds = (
      await this.prisma.ideaSubmissionCycle.findMany({
        where: { academicYearId: activeYear.id },
        select: { id: true },
      })
    ).map((c) => c.id);
    if (cycleIds.length === 0) throw new NotFoundException('Idea not found.');

    const idea = await this.prisma.idea.findFirst({
      where: { id: ideaId, cycleId: { in: cycleIds } },
      select: { id: true, cycle: { select: { interactionClosesAt: true } } },
    });
    if (!idea?.cycle) throw new NotFoundException('Idea not found.');

    const interactionClosesAt = idea.cycle.interactionClosesAt;
    if (new Date() >= interactionClosesAt) {
      throw new BadRequestException(
        'Voting and commenting for this idea have closed.',
      );
    }
    return interactionClosesAt;
  }

  /**
   * Set, update, or remove the current user's vote on an idea.
   * One vote per user; value is 'up' or 'down'. Pressing the same button again removes the vote.
   * Idea must be in active academic year and interaction window must be open.
   */
  async setVote(ideaId: string, userId: string, body: VoteIdeaBody) {
    await this.ensureIdeaInActiveYearAndInteractionOpen(ideaId);

    const existing = await this.prisma.ideaVote.findUnique({
      where: { ideaId_userId: { ideaId, userId } },
      select: { value: true },
    });

    if (existing?.value === body.value) {
      await this.prisma.ideaVote.delete({
        where: { ideaId_userId: { ideaId, userId } },
      });
    } else {
      await this.prisma.ideaVote.upsert({
        where: {
          ideaId_userId: { ideaId, userId },
        },
        create: { ideaId, userId, value: body.value },
        update: { value: body.value },
      });
    }

    return this.findOne(ideaId, userId);
  }

  /**
   * List comments for an idea. Idea must be in active academic year. Author shown only when !isAnonymous.
   */
  async getComments(ideaId: string) {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) throw new NotFoundException('Idea not found.');

    const cycleIds = (
      await this.prisma.ideaSubmissionCycle.findMany({
        where: { academicYearId: activeYear.id },
        select: { id: true },
      })
    ).map((c) => c.id);
    if (cycleIds.length === 0) throw new NotFoundException('Idea not found.');

    const idea = await this.prisma.idea.findFirst({
      where: { id: ideaId, cycleId: { in: cycleIds } },
      select: { id: true },
    });
    if (!idea) throw new NotFoundException('Idea not found.');

    const comments = await this.prisma.ideaComment.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        isAnonymous: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      isAnonymous: c.isAnonymous,
      createdAt: c.createdAt,
      author: c.isAnonymous
        ? null
        : { id: c.user.id, fullName: c.user.fullName, email: c.user.email },
    }));
  }

  /**
   * Create a comment on an idea. Author is stored in DB; display is anonymous when isAnonymous is true.
   * Idea must be in active academic year and interaction window must be open.
   */
  async createComment(ideaId: string, userId: string, body: CreateCommentBody) {
    await this.ensureIdeaInActiveYearAndInteractionOpen(ideaId);

    const comment = await this.prisma.ideaComment.create({
      data: {
        ideaId,
        userId,
        content: body.content,
        isAnonymous: body.isAnonymous ?? false,
      },
      select: {
        id: true,
        content: true,
        isAnonymous: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return {
      id: comment.id,
      content: comment.content,
      isAnonymous: comment.isAnonymous,
      createdAt: comment.createdAt,
      author: comment.isAnonymous
        ? null
        : {
            id: comment.user.id,
            fullName: comment.user.fullName,
            email: comment.user.email,
          },
    };
  }

  /**
   * Resolve attachment by id for streaming. Ensures attachment belongs to an idea in the active year (same visibility as findOne).
   * Returns secureUrl, fileName, mimeType for the controller to proxy the file with correct Content-Disposition.
   */
  async getAttachmentForStream(attachmentId: string): Promise<{
    secureUrl: string;
    fileName: string;
    mimeType: string | null;
  }> {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) throw new NotFoundException('Attachment not found.');

    const cycleIds = (
      await this.prisma.ideaSubmissionCycle.findMany({
        where: { academicYearId: activeYear.id },
        select: { id: true },
      })
    ).map((c) => c.id);
    if (cycleIds.length === 0) throw new NotFoundException('Attachment not found.');

    const attachment = await this.prisma.ideaAttachment.findFirst({
      where: { id: attachmentId, idea: { cycleId: { in: cycleIds } } },
      select: { secureUrl: true, fileName: true, mimeType: true },
    });
    if (!attachment) throw new NotFoundException('Attachment not found.');
    return attachment;
  }

  /**
   * Create idea. Upon submission the backend validates (all must pass; otherwise appropriate error, no data stored):
   * - User role and permissions (STAFF enforced at controller via @Roles('STAFF'))
   * - Existence and status of the active Idea Submission Cycle (ACTIVE, for active academic year)
   * - Submission time window (current time < ideaSubmissionClosesAt)
   * - Acceptance of Terms and Conditions (termsAccepted === true)
   * - Category belongs to the cycle (category in cycle’s categories)
   * - Integrity of submitted data and attachments (schema + category check)
   * Author is always stored (submittedById); isAnonymous only affects display.
   */
  async create(userId: string, body: CreateIdeaBody) {
    if (!body.termsAccepted) {
      throw new BadRequestException(
        'You must accept the Terms and Conditions to submit an idea.',
      );
    }

    const cycle = await this.getActiveCycle();
    if (!cycle || cycle.id !== body.cycleId) {
      throw new BadRequestException(
        'No active submission cycle is open for ideas, or the selected cycle is not active.',
      );
    }
    const now = new Date();
    if (cycle.ideaSubmissionClosesAt <= now) {
      throw new BadRequestException(
        'The submission period for this cycle has closed.',
      );
    }

    const categoryInCycle = await this.prisma.cycleCategory.findFirst({
      where: { cycleId: body.cycleId, categoryId: body.categoryId },
      select: { id: true },
    });
    if (!categoryInCycle) {
      throw new BadRequestException(
        'The selected category is not available for this submission cycle.',
      );
    }

    const trimmedTitle = body.title.trim();
    const existingWithSameTitle = await this.prisma.idea.findFirst({
      where: {
        cycleId: body.cycleId,
        title: { equals: trimmedTitle, mode: 'insensitive' },
      },
      select: { id: true },
    });
    if (existingWithSameTitle) {
      throw new BadRequestException(
        'A proposal with this title already exists in this submission cycle.',
      );
    }

    const idea = await this.prisma.idea.create({
      data: {
        title: body.title,
        description: body.description,
        categoryId: body.categoryId,
        cycleId: body.cycleId,
        submittedById: userId,
        isAnonymous: body.isAnonymous,
        termsAcceptedAt: new Date(),
        attachments: {
          create: (body.attachments ?? []).map((a) => ({
            cloudinaryPublicId: a.cloudinaryPublicId,
            secureUrl: a.secureUrl,
            fileName: a.fileName,
            mimeType: a.mimeType ?? null,
            sizeBytes: a.sizeBytes ?? null,
          })),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        isAnonymous: true,
        createdAt: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
        cycleId: true,
        attachments: {
          select: {
            id: true,
            fileName: true,
            secureUrl: true,
            mimeType: true,
            sizeBytes: true,
          },
        },
      },
    });
    return idea;
  }

  /**
   * Return signed upload params for Cloudinary (STAFF only).
   * Used by the frontend to upload supporting documents directly to Cloudinary.
   * Throws if Cloudinary env vars are not configured.
   */
  getUploadParams(): {
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
  } {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'File upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string | number> = {
      folder: CLOUDINARY_UPLOAD_FOLDER,
      timestamp,
    };
    const paramString = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');
    const signature = crypto
      .createHmac('sha1', apiSecret)
      .update(paramString)
      .digest('hex');
    return {
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder: CLOUDINARY_UPLOAD_FOLDER,
    };
  }

  /**
   * Delete an idea and its Cloudinary attachments (2026 standard).
   * ADMIN only. Removes idea from DB (cascade deletes IdeaAttachment) and deletes
   * attachment files from Cloudinary when configured.
   */
  async deleteIdea(ideaId: string): Promise<void> {
    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      select: {
        id: true,
        attachments: { select: { cloudinaryPublicId: true } },
      },
    });
    if (!idea) {
      throw new NotFoundException('Idea not found.');
    }
    const publicIds = idea.attachments.map((a) => a.cloudinaryPublicId);
    if (publicIds.length > 0 && this.cloudinary.isConfigured()) {
      try {
        await this.cloudinary.deleteResources(publicIds, 'raw');
      } catch {
        // Log but do not block DB delete; orphaned Cloudinary assets can be cleaned later
      }
    }
    await this.prisma.idea.delete({ where: { id: ideaId } });
  }
}
