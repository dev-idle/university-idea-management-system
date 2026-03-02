import * as crypto from 'node:crypto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EVENTS } from '../notification/constants';
import type { CreateIdeaBody } from './dto/create-idea.dto';
import type { VoteIdeaBody } from './dto/vote-idea.dto';
import type { CreateCommentBody } from './dto/create-comment.dto';
import type { UpdateCommentBody } from './dto/update-comment.dto';
import type { LikeCommentBody } from './dto/like-comment.dto';
import type { UpdateIdeaBody, AddAttachmentBody } from './dto/update-idea.dto';

const STATUS_ACTIVE = 'ACTIVE';
const CLOUDINARY_UPLOAD_FOLDER = 'idea-attachments';

/**
 * All cycles in the active year (for browse mode when no active cycle).
 * Used for both getContext (closedCyclesForYear) and resolveCycleIdsForIdeas.
 */
function allCyclesInYearWhere(activeYearId: string) {
  return { academicYearId: activeYearId };
}

/**
 * Resolve cycle IDs for listing ideas.
 * - ACTIVE cycle with interaction open: use only that cycle.
 * - Otherwise: all cycles in the active year (user can browse past cycles).
 */
async function resolveCycleIdsForIdeas(
  prisma: PrismaService,
  activeYearId: string,
  cycleId?: string,
): Promise<string[]> {
  const now = new Date();
  const activeCycle = await prisma.ideaSubmissionCycle.findFirst({
    where: { status: STATUS_ACTIVE, academicYearId: activeYearId },
    select: { id: true, interactionClosesAt: true },
  });
  const interactionOpen = activeCycle && activeCycle.interactionClosesAt > now;
  if (interactionOpen) return [activeCycle!.id];

  if (cycleId) {
    const cycle = await prisma.ideaSubmissionCycle.findFirst({
      where: { id: cycleId, ...allCyclesInYearWhere(activeYearId) },
      select: { id: true },
    });
    return cycle ? [cycle.id] : [];
  }
  const all = await prisma.ideaSubmissionCycle.findMany({
    where: allCyclesInYearWhere(activeYearId),
    select: { id: true },
    orderBy: { interactionClosesAt: 'desc' },
  });
  return all.map((c) => c.id);
}

@Injectable()
export class IdeasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly cloudinary: CloudinaryService,
    private readonly eventEmitter: EventEmitter2,
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
            name: true,
            ideaSubmissionClosesAt: true,
            interactionClosesAt: true,
            academicYearId: true,
          },
        })
      : null;
    const now = new Date();
    const canSubmit = !!cycle && cycle.ideaSubmissionClosesAt > now;
    const interactionOpen =
      !!cycle?.interactionClosesAt && new Date(cycle.interactionClosesAt) > now;
    const hasActiveCycle = !!cycle && interactionOpen;

    let categories: Array<{ id: string; name: string }> = [];
    let departmentsForFilter: Array<{ id: string; name: string }> = [];
    if (cycle && hasActiveCycle) {
      const cycleCategories = await this.prisma.cycleCategory.findMany({
        where: { cycleId: cycle.id },
        select: { category: { select: { id: true, name: true } } },
      });
      categories = cycleCategories.map((cc) => cc.category);
      departmentsForFilter = await this.getAllDepartmentsForFilter();
    }

    let closedCyclesForYear: Array<{
      id: string;
      name: string;
      categories: Array<{ id: string; name: string }>;
      departments: Array<{ id: string; name: string }>;
    }> = [];
    if (activeYear && !hasActiveCycle) {
      const allCycles = await this.prisma.ideaSubmissionCycle.findMany({
        where: allCyclesInYearWhere(activeYear.id),
        select: { id: true, name: true },
        orderBy: { interactionClosesAt: 'desc' },
      });
      const cycleIdsWithIdeas = await this.prisma.idea.groupBy({
        by: ['cycleId'],
        where: {
          cycleId: { in: allCycles.map((c) => c.id) },
        },
        _count: { id: true },
      });
      const nonEmptyCycleIds = new Set(
        cycleIdsWithIdeas.filter((g) => g._count.id > 0).map((g) => g.cycleId!),
      );
      for (const c of allCycles) {
        if (!nonEmptyCycleIds.has(c.id)) continue;
        const cycleCategories = await this.prisma.cycleCategory.findMany({
          where: { cycleId: c.id },
          select: { category: { select: { id: true, name: true } } },
        });
        const departments = await this.getAllDepartmentsForFilter();
        closedCyclesForYear.push({
          id: c.id,
          name: c.name ?? 'Unnamed',
          categories: cycleCategories.map((cc) => cc.category),
          departments,
        });
      }
    }

    const { allAcademicYearsForFilter, allCyclesForFilter } =
      await this.buildMyIdeasFilterOptions(userId);

    return {
      canSubmit,
      activeCycleId: hasActiveCycle ? cycle!.id : null,
      activeCycleName: cycle?.name ?? null,
      submissionClosesAt: cycle?.ideaSubmissionClosesAt ?? null,
      interactionClosesAt: cycle?.interactionClosesAt ?? null,
      activeAcademicYear: activeYear
        ? { id: activeYear.id, name: activeYear.name }
        : null,
      categories,
      departmentsForFilter,
      closedCyclesForYear,
      allCyclesForFilter,
      allAcademicYearsForFilter,
    };
  }

  /** Department names excluded from Ideas Hub filter (internal/admin departments). */
  private static readonly EXCLUDED_DEPARTMENT_NAMES = new Set([
    'IT Services / System Administration Department',
    'Quality Assurance Office',
  ]);

  /** All departments for Ideas Hub filter, excluding internal/admin. Includes departments with zero ideas. */
  private async getAllDepartmentsForFilter(): Promise<
    Array<{ id: string; name: string }>
  > {
    const all = await this.prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return all.filter(
      (d) => !IdeasService.EXCLUDED_DEPARTMENT_NAMES.has(d.name.trim()),
    );
  }

  /**
   * Filter options for My Ideas page: only years, cycles, and categories where the user has submitted ideas.
   */
  getMyIdeasFilters(userId: string) {
    return this.buildMyIdeasFilterOptions(userId);
  }

  private async buildMyIdeasFilterOptions(userId: string) {
    const ideasWithCycles = await this.prisma.idea.findMany({
      where: { submittedById: userId, cycleId: { not: null } },
      select: { cycleId: true, cycle: { select: { academicYearId: true } } },
      distinct: ['cycleId'],
    });
    const yearIds = [
      ...new Set(
        ideasWithCycles
          .map((i) => i.cycle?.academicYearId)
          .filter((id): id is string => !!id),
      ),
    ];
    const allAcademicYearsForFilter =
      yearIds.length > 0
        ? await this.prisma.academicYear.findMany({
            where: { id: { in: yearIds } },
            select: { id: true, name: true },
            orderBy: { name: 'desc' },
          })
        : [];

    const userCycleIds = ideasWithCycles
      .map((i) => i.cycleId)
      .filter((id): id is string => !!id);
    const allCycles =
      userCycleIds.length > 0
        ? await this.prisma.ideaSubmissionCycle.findMany({
            where: { id: { in: userCycleIds } },
            select: { id: true, name: true, academicYearId: true },
            orderBy: { interactionClosesAt: 'desc' },
          })
        : [];

    const allCyclesForFilter: Array<{
      id: string;
      name: string;
      academicYearId: string;
      categories: Array<{ id: string; name: string }>;
    }> = [];
    for (const c of allCycles) {
      const userCategoryIds = await this.prisma.idea.findMany({
        where: {
          submittedById: userId,
          cycleId: c.id,
          categoryId: { not: null },
        },
        select: { categoryId: true },
        distinct: ['categoryId'],
      });
      const ids = userCategoryIds
        .map((i) => i.categoryId)
        .filter((id): id is string => !!id);
      const categories =
        ids.length > 0
          ? await this.prisma.category.findMany({
              where: { id: { in: ids } },
              select: { id: true, name: true },
            })
          : [];
      allCyclesForFilter.push({
        id: c.id,
        name: c.name ?? 'Unnamed',
        academicYearId: c.academicYearId,
        categories,
      });
    }
    return { allAcademicYearsForFilter, allCyclesForFilter };
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
      submittedBy: {
        id: string;
        fullName: string | null;
        email: string;
      } | null;
      attachments: Array<{
        id: string;
        fileName: string;
        secureUrl: string;
        mimeType: string | null;
        sizeBytes: number | null;
      }>;
      votes?: Array<{ value: string; userId: string }>;
      _count?: { comments?: number; views?: number };
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
      viewCount: idea._count?.views ?? 0,
    };
  }

  /**
   * List ideas with pagination and sort.
   * - When there is an ACTIVE cycle: only ideas within that cycle.
   * - When there is no ACTIVE cycle: ideas from all CLOSED cycles in the active academic year.
   * Sort: latest (default), mostPopular, mostViewed, latestComments (by most recent comment).
   * Author is hidden when idea.isAnonymous. Optional userId for myVote.
   */
  async findAllForActiveYear(params: {
    page?: number;
    limit?: number;
    sort?: 'latest' | 'mostPopular' | 'mostViewed' | 'latestComments' | 'mostComments';
    categoryId?: string;
    cycleId?: string;
    departmentId?: string;
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

    const cycleIds = await resolveCycleIdsForIdeas(
      this.prisma,
      activeYear.id,
      params.cycleId,
    );
    if (cycleIds.length === 0) return { items: [], total: 0 };

    const userId = params.userId;
    const where = {
      cycleId: { in: cycleIds },
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.departmentId && {
        submittedBy: { departmentId: params.departmentId },
      }),
    };

    const ideaSelect = {
      id: true as const,
      title: true as const,
      description: true as const,
      isAnonymous: true as const,
      createdAt: true as const,
      categoryId: true as const,
      category: { select: { id: true, name: true } },
      cycleId: true as const,
      submittedById: true as const,
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
      _count: { select: { comments: true, views: true } },
    };

    /* ── Most Popular: sort by (upvotes − downvotes), tie-break: comments + 0.01×views ─ */
    if (sort === 'mostPopular') {
      const [allIdeas, total] = await Promise.all([
        this.prisma.idea.findMany({
          where,
          select: {
            id: true,
            createdAt: true,
            votes: { select: { value: true } },
            _count: { select: { comments: true, views: true } },
          },
        }),
        this.prisma.idea.count({ where }),
      ]);

      const scored = allIdeas.map((idea) => {
        let net = 0;
        for (const v of idea.votes) net += v.value === 'up' ? 1 : -1;
        const tieBreak = idea._count.comments + 0.01 * idea._count.views;
        return { id: idea.id, createdAt: idea.createdAt, net, tieBreak };
      });
      scored.sort(
        (a, b) =>
          b.net - a.net ||
          b.tieBreak - a.tieBreak ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      );

      const pageIds = scored
        .slice((page - 1) * limit, page * limit)
        .map((s) => s.id);
      if (pageIds.length === 0) return { items: [], total };

      const ideas = await this.prisma.idea.findMany({
        where: { id: { in: pageIds } },
        select: ideaSelect,
      });

      const idOrder = new Map(pageIds.map((id, i) => [id, i]));
      ideas.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

      return {
        items: ideas.map((idea) => this.mapIdeaToResponse(idea, userId)),
        total,
      };
    }

    /* ── Latest Comments: sort by most recent comment per idea ─────────── */
    if (sort === 'latestComments') {
      const latestByIdea = await this.prisma.ideaComment.groupBy({
        by: ['ideaId'],
        _max: { createdAt: true },
        where: { idea: { cycleId: { in: cycleIds } } },
      });
      const ideaToLastComment = new Map(
        latestByIdea.map((r) => [r.ideaId, r._max.createdAt as Date]),
      );
      const [allIdeas, total] = await Promise.all([
        this.prisma.idea.findMany({
          where,
          select: { id: true, createdAt: true },
        }),
        this.prisma.idea.count({ where }),
      ]);
      const scored = allIdeas.map((idea) => ({
        id: idea.id,
        lastCommentAt: ideaToLastComment.get(idea.id) ?? new Date(0),
        createdAt: idea.createdAt,
      }));
      scored.sort(
        (a, b) =>
          b.lastCommentAt.getTime() - a.lastCommentAt.getTime() ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      );
      const pageIds = scored
        .slice((page - 1) * limit, page * limit)
        .map((s) => s.id);
      if (pageIds.length === 0) return { items: [], total };
      const ideas = await this.prisma.idea.findMany({
        where: { id: { in: pageIds } },
        select: ideaSelect,
      });
      const idOrder = new Map(pageIds.map((id, i) => [id, i]));
      ideas.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));
      return {
        items: ideas.map((idea) => this.mapIdeaToResponse(idea, userId)),
        total,
      };
    }

    /* ── Most Comments: sort by comment count, tie-break: (up−down) + 0.01×views ─ */
    if (sort === 'mostComments') {
      const [allIdeas, total] = await Promise.all([
        this.prisma.idea.findMany({
          where,
          select: {
            id: true,
            createdAt: true,
            votes: { select: { value: true } },
            _count: { select: { comments: true, views: true } },
          },
        }),
        this.prisma.idea.count({ where }),
      ]);
      const scored = allIdeas.map((idea) => {
        let net = 0;
        for (const v of idea.votes) net += v.value === 'up' ? 1 : -1;
        const tieBreak = net + 0.01 * idea._count.views;
        return { id: idea.id, createdAt: idea.createdAt, comments: idea._count.comments, tieBreak };
      });
      scored.sort(
        (a, b) =>
          b.comments - a.comments ||
          b.tieBreak - a.tieBreak ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      );
      const pageIds = scored
        .slice((page - 1) * limit, page * limit)
        .map((s) => s.id);
      if (pageIds.length === 0) return { items: [], total };

      const ideas = await this.prisma.idea.findMany({
        where: { id: { in: pageIds } },
        select: ideaSelect,
      });
      const idOrder = new Map(pageIds.map((id, i) => [id, i]));
      ideas.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

      return {
        items: ideas.map((idea) => this.mapIdeaToResponse(idea, userId)),
        total,
      };
    }

    /* ── Most Viewed: sort by view count, tie-break: (up−down) + 0.1×comments ─ */
    if (sort === 'mostViewed') {
      const [allIdeas, total] = await Promise.all([
        this.prisma.idea.findMany({
          where,
          select: {
            id: true,
            createdAt: true,
            votes: { select: { value: true } },
            _count: { select: { comments: true, views: true } },
          },
        }),
        this.prisma.idea.count({ where }),
      ]);
      const scored = allIdeas.map((idea) => {
        let net = 0;
        for (const v of idea.votes) net += v.value === 'up' ? 1 : -1;
        const tieBreak = net + 0.1 * idea._count.comments;
        return {
          id: idea.id,
          createdAt: idea.createdAt,
          views: idea._count.views,
          tieBreak,
        };
      });
      scored.sort(
        (a, b) =>
          b.views - a.views ||
          b.tieBreak - a.tieBreak ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      );
      const pageIds = scored
        .slice((page - 1) * limit, page * limit)
        .map((s) => s.id);
      if (pageIds.length === 0) return { items: [], total };

      const ideas = await this.prisma.idea.findMany({
        where: { id: { in: pageIds } },
        select: ideaSelect,
      });
      const idOrder = new Map(pageIds.map((id, i) => [id, i]));
      ideas.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

      return {
        items: ideas.map((idea) => this.mapIdeaToResponse(idea, userId)),
        total,
      };
    }

    /* ── Latest: Prisma orderBy ─────────────────────────────────────────── */
    const [items, total] = await Promise.all([
      this.prisma.idea.findMany({
        where,
        select: ideaSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.idea.count({ where }),
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
        _count: { select: { comments: true, views: true } },
        cycle: { select: { status: true, ideaSubmissionClosesAt: true, interactionClosesAt: true } },
      },
    });
    if (!idea) throw new NotFoundException('Idea not found.');
    const mapped = this.mapIdeaToResponse(idea, userId);
    return {
      ...mapped,
      cycleStatus: idea.cycle?.status ?? null,
      submissionClosesAt: idea.cycle?.ideaSubmissionClosesAt ?? null,
      interactionClosesAt: idea.cycle?.interactionClosesAt ?? null,
    };
  }

  /**
   * Ensure idea exists in active academic year, cycle is ACTIVE, and interaction window is open.
   * Throws NotFoundException if idea not found; BadRequestException if cycle closed or interaction window closed.
   */
  private async ensureIdeaInActiveYearAndInteractionOpen(
    ideaId: string,
  ): Promise<Date> {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) throw new NotFoundException('Idea not found.');

    const idea = await this.prisma.idea.findFirst({
      where: {
        id: ideaId,
        cycle: { academicYearId: activeYear.id },
      },
      select: { id: true, cycle: { select: { status: true, interactionClosesAt: true } } },
    });
    if (!idea?.cycle) throw new NotFoundException('Idea not found.');

    if (idea.cycle.status !== STATUS_ACTIVE) {
      throw new BadRequestException(
        'Voting and commenting are only available during an active proposal cycle.',
      );
    }

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

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.ideaVote.findUnique({
        where: { ideaId_userId: { ideaId, userId } },
        select: { value: true },
      });

      if (existing?.value === body.value) {
        await tx.ideaVote.delete({
          where: { ideaId_userId: { ideaId, userId } },
        });
      } else {
        await tx.ideaVote.upsert({
          where: { ideaId_userId: { ideaId, userId } },
          create: { ideaId, userId, value: body.value },
          update: { value: body.value },
        });
      }
    });

    return this.findOne(ideaId, userId);
  }

  /** Map DB comment to API shape. Enforces author=null when isAnonymous (never leak identity). */
  private mapCommentToApi(
    c: {
      id: string;
      content: string;
      isAnonymous: boolean;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      parentCommentId: string | null;
      user?: { id: string; fullName: string | null; email: string };
      likes?: { userId: string; value: string }[];
    },
    currentUserId?: string,
  ) {
    const upCount = c.likes?.filter((l) => l.value === 'up').length ?? 0;
    const downCount = c.likes?.filter((l) => l.value === 'down').length ?? 0;
    const myReaction = currentUserId
      ? (c.likes?.find((l) => l.userId === currentUserId)?.value as 'up' | 'down' | undefined) ?? null
      : null;
    const isOwn = currentUserId && c.userId === currentUserId;
    return {
      id: c.id,
      content: c.content,
      isAnonymous: c.isAnonymous,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      parentCommentId: c.parentCommentId,
      likeCount: upCount,
      dislikeCount: downCount,
      myReaction,
      isOwn: !!isOwn,
      author: c.isAnonymous
        ? null
        : c.user
          ? { id: c.user.id, fullName: c.user.fullName, email: c.user.email }
          : null,
    };
  }

  /**
   * List comments for an idea. Idea must be in active academic year.
   * Returns top-level comments with nested replies. Includes likeCount, myLike, isOwn.
   */
  async getComments(ideaId: string, userId: string) {
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
        updatedAt: true,
        userId: true,
        parentCommentId: true,
        user: { select: { id: true, fullName: true, email: true } },
        likes: { select: { userId: true, value: true } },
      },
    });

    const mapped = comments.map((c) =>
      this.mapCommentToApi(
        { ...c, likes: c.likes as { userId: string; value: string }[] },
        userId,
      ),
    );

    type CommentNode = (typeof mapped)[0] & { replies: CommentNode[] };
    const byId = new Map<string, CommentNode>(
      mapped.map((m) => [m.id, { ...m, replies: [] }]),
    );
    const roots: CommentNode[] = [];
    for (const m of mapped) {
      const node = byId.get(m.id)!;
      if (!m.parentCommentId) {
        roots.push(node);
      } else {
        const parent = byId.get(m.parentCommentId);
        if (parent) parent.replies.push(node);
        else roots.push(node);
      }
    }
    return roots;
  }

  /**
   * Create a comment on an idea. Author is stored in DB; display is anonymous when isAnonymous is true.
   * Idea must be in active academic year and interaction window must be open.
   * If parentCommentId provided, creates a reply; parent must belong to same idea.
   */
  async createComment(ideaId: string, userId: string, body: CreateCommentBody) {
    await this.ensureIdeaInActiveYearAndInteractionOpen(ideaId);

    if (body.parentCommentId) {
      const parent = await this.prisma.ideaComment.findFirst({
        where: { id: body.parentCommentId, ideaId },
        select: { id: true, parentCommentId: true },
      });
      if (!parent)
        throw new BadRequestException('Parent comment not found or does not belong to this idea.');
    }

    const comment = await this.prisma.ideaComment.create({
      data: {
        ideaId,
        userId,
        content: body.content,
        isAnonymous: body.isAnonymous ?? false,
        parentCommentId: body.parentCommentId ?? null,
      },
      select: {
        id: true,
        content: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        parentCommentId: true,
        user: { select: { id: true, fullName: true, email: true } },
        idea: { select: { title: true, submittedById: true } },
        likes: { select: { userId: true, value: true } },
      },
    });

    // Emit event for multi-channel notifications (Email + In-app) — only for top-level comments to idea author
    const recipientId = comment.idea.submittedById;
    if (recipientId && recipientId !== userId && !body.parentCommentId) {
      const isAnonymous = body.isAnonymous ?? false;
      const commenterDisplayName = isAnonymous
        ? 'Anonymous'
        : comment.user.fullName?.trim() || comment.user.email;
      this.eventEmitter.emit(EVENTS.COMMENT_CREATED, {
        type: 'comment.created',
        ideaId,
        ideaTitle: comment.idea.title,
        commentId: comment.id,
        recipientUserId: recipientId,
        commenterDisplayName,
        commenterEmail: isAnonymous ? undefined : comment.user.email,
        isAnonymous,
      });
    }

    return this.mapCommentToApi(
      { ...comment, likes: (comment.likes ?? []) as { userId: string; value: string }[] },
      userId,
    );
  }

  /**
   * Update own comment. Idea must be in active academic year and interaction window must be open.
   */
  async updateComment(
    ideaId: string,
    commentId: string,
    userId: string,
    body: UpdateCommentBody,
  ) {
    await this.ensureIdeaInActiveYearAndInteractionOpen(ideaId);

    const comment = await this.prisma.ideaComment.findFirst({
      where: { id: commentId, ideaId },
      select: { id: true, userId: true },
    });
    if (!comment) throw new NotFoundException('Comment not found.');
    if (comment.userId !== userId)
      throw new BadRequestException('You can only edit your own comments.');

    const updated = await this.prisma.ideaComment.update({
      where: { id: commentId },
      data: { content: body.content },
      select: {
        id: true,
        content: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        parentCommentId: true,
        user: { select: { id: true, fullName: true, email: true } },
        likes: { select: { userId: true, value: true } },
      },
    });
    return this.mapCommentToApi(
      { ...updated, likes: updated.likes as { userId: string; value: string }[] },
      userId,
    );
  }

  /**
   * Delete own comment. Idea must be in active academic year and interaction window must be open.
   */
  async deleteComment(ideaId: string, commentId: string, userId: string): Promise<void> {
    await this.ensureIdeaInActiveYearAndInteractionOpen(ideaId);

    const comment = await this.prisma.ideaComment.findFirst({
      where: { id: commentId, ideaId },
      select: { userId: true },
    });
    if (!comment) throw new NotFoundException('Comment not found.');
    if (comment.userId !== userId)
      throw new BadRequestException('You can only delete your own comments.');

    await this.prisma.ideaComment.delete({ where: { id: commentId } });
  }

  /**
   * Set or toggle like/dislike on a comment. Idea must be in active academic year and interaction window must be open.
   * value: 'up' = like, 'down' = dislike. Clicking same value removes; clicking opposite switches.
   */
  async likeComment(ideaId: string, commentId: string, userId: string, body: LikeCommentBody) {
    await this.ensureIdeaInActiveYearAndInteractionOpen(ideaId);

    const comment = await this.prisma.ideaComment.findFirst({
      where: { id: commentId, ideaId },
      select: { id: true },
    });
    if (!comment) throw new NotFoundException('Comment not found.');

    const existing = await this.prisma.ideaCommentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existing) {
      if (existing.value === body.value) {
        await this.prisma.ideaCommentLike.delete({
          where: { commentId_userId: { commentId, userId } },
        });
      } else {
        await this.prisma.ideaCommentLike.update({
          where: { commentId_userId: { commentId, userId } },
          data: { value: body.value },
        });
      }
    } else {
      await this.prisma.ideaCommentLike.create({
        data: { commentId, userId, value: body.value },
      });
    }

    const updated = await this.prisma.ideaComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        content: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        parentCommentId: true,
        user: { select: { id: true, fullName: true, email: true } },
        likes: { select: { userId: true, value: true } },
      },
    });
    if (!updated) throw new NotFoundException('Comment not found.');
    return this.mapCommentToApi(
      { ...updated, likes: updated.likes as { userId: string; value: string }[] },
      userId,
    );
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
    if (cycleIds.length === 0)
      throw new NotFoundException('Attachment not found.');

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
        'No active proposal cycle is open for ideas, or the selected cycle is not active.',
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
        'The selected category is not available for this proposal cycle.',
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
        'A proposal with this title already exists in this proposal cycle.',
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

    // Emit event for multi-channel notifications (Email + In-app)
    const submitter = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        departmentId: true,
        fullName: true,
        email: true,
        department: { select: { name: true } },
      },
    });
    if (submitter?.departmentId) {
      const isAnonymous = body.isAnonymous ?? true;
      const submitterDisplayName = isAnonymous
        ? 'Anonymous'
        : submitter.fullName?.trim() || submitter.email;
      this.eventEmitter.emit(EVENTS.IDEA_CREATED, {
        type: 'idea.created',
        ideaId: idea.id,
        ideaTitle: idea.title,
        departmentId: submitter.departmentId,
        departmentName: submitter.department?.name,
        submitterDisplayName,
        submitterEmail: isAnonymous ? undefined : submitter.email,
        isAnonymous,
        attachmentLinks: (idea.attachments ?? []).map((a) => ({
          fileName: a.fileName,
          secureUrl: a.secureUrl,
        })),
      });
    }

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
   * Latest comments across all ideas in the active academic year.
   * Returns comment text, author (hidden when anonymous), and the idea it belongs to.
   */
  async getLatestComments(params: { limit?: number }) {
    const limit = Math.min(50, Math.max(1, params.limit ?? 10));

    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) return [];

    const cycleIds = (
      await this.prisma.ideaSubmissionCycle.findMany({
        where: { academicYearId: activeYear.id },
        select: { id: true },
      })
    ).map((c) => c.id);
    if (cycleIds.length === 0) return [];

    const comments = await this.prisma.ideaComment.findMany({
      where: { idea: { cycleId: { in: cycleIds } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        content: true,
        isAnonymous: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true } },
        idea: { select: { id: true, title: true } },
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
      idea: { id: c.idea.id, title: c.idea.title },
    }));
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

  /**
   * Record a view for an idea by the current user.
   *
   * Own-idea cap: viewing one's own proposal counts at most 1 view total,
   * regardless of how many times they revisit. Prevents authors from inflating
   * their view count.
   *
   * Other-idea window: 20-minute session cooldown. If this user already has
   * a view record within the last 20 minutes, no new record is created.
   * Prevents spam from refreshes and rapid interactions.
   *
   * The frontend also enforces the window via localStorage; backend is authoritative (zero-trust).
   */
  private static readonly VIEW_COOLDOWN_MS = 20 * 60 * 1000; // 20 minutes

  async recordView(
    ideaId: string,
    userId: string,
    roles: string[] = [],
  ): Promise<void> {
    // QA Coordinator: view-only; do not count views
    if (roles.some((r) => r.toUpperCase() === 'QA_COORDINATOR')) return;

    const idea = await this.prisma.idea.findUnique({
      where: { id: ideaId },
      select: { id: true, submittedById: true },
    });
    if (!idea) throw new NotFoundException('Idea not found.');

    const isOwnIdea =
      idea.submittedById != null && idea.submittedById === userId;

    if (isOwnIdea) {
      // Own idea: at most 1 view ever
      const existingView = await this.prisma.ideaView.findFirst({
        where: { ideaId, userId },
        select: { id: true },
      });
      if (existingView) return; // Already counted — no-op
    } else {
      // Others' ideas: 20-minute cooldown
      const cutoff = new Date(Date.now() - IdeasService.VIEW_COOLDOWN_MS);
      const recentView = await this.prisma.ideaView.findFirst({
        where: { ideaId, userId, createdAt: { gte: cutoff } },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      if (recentView) return; // Still within session window — no-op
    }

    await this.prisma.ideaView.create({
      data: { ideaId, userId },
    });
  }

  /* ────────────────────────────────────────────────────────────────────────────
   * Own‑idea management (STAFF only).
   * Every method enforces ownership (submittedById === userId). Zero‑trust.
   * ──────────────────────────────────────────────────────────────────────────── */

  /**
   * Ensure idea exists and belongs to the given user. Returns basic info + cycle
   * closure date and attachments (for Cloudinary cleanup).
   */
  private async ensureOwnIdea(ideaId: string, userId: string) {
    const idea = await this.prisma.idea.findFirst({
      where: { id: ideaId, submittedById: userId },
      select: {
        id: true,
        cycleId: true,
        cycle: {
          select: {
            status: true,
            ideaSubmissionClosesAt: true,
          },
        },
        attachments: { select: { cloudinaryPublicId: true } },
      },
    });
    if (!idea) throw new NotFoundException('Idea not found.');
    return idea;
  }

  /**
   * List the current user's own ideas with pagination (across all cycles / years).
   * Sorted newest‑first. Returns submissionClosesAt per idea so the frontend
   * can determine whether editing is still allowed.
   * Optional filters: categoryId, cycleId, academicYearId.
   * cycleId and academicYearId are restricted to cycles/years where the user has ideas.
   */
  async findOwnIdeas(
    userId: string,
    params: {
      page?: number;
      limit?: number;
      categoryId?: string;
      cycleId?: string;
      academicYearId?: string;
    },
  ) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 5));

    const userCyclesData = await this.prisma.idea.findMany({
      where: { submittedById: userId, cycleId: { not: null } },
      select: {
        cycleId: true,
        cycle: { select: { academicYearId: true } },
      },
      distinct: ['cycleId'],
    });
    const allowedCycleIds = userCyclesData
      .map((i) => i.cycleId)
      .filter((id): id is string => !!id);
    const allowedYearIds = [
      ...new Set(
        userCyclesData
          .map((i) => i.cycle?.academicYearId)
          .filter((id): id is string => !!id),
      ),
    ];

    const cycleIdFilter =
      params.cycleId && allowedCycleIds.includes(params.cycleId)
        ? params.cycleId
        : undefined;
    const yearIdFilter =
      params.academicYearId &&
      allowedYearIds.includes(params.academicYearId) &&
      !cycleIdFilter
        ? params.academicYearId
        : undefined;

    const where = {
      submittedById: userId,
      ...(cycleIdFilter
        ? { cycleId: cycleIdFilter }
        : { cycleId: { in: allowedCycleIds } }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(yearIdFilter && {
        cycle: { academicYearId: yearIdFilter },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.idea.findMany({
        where,
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
          _count: { select: { comments: true, views: true } },
          cycle: {
            select: {
              ideaSubmissionClosesAt: true,
              interactionClosesAt: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.idea.count({ where }),
    ]);

    return {
      items: items.map((idea) => ({
        ...this.mapIdeaToResponse(idea, userId),
        submissionClosesAt: idea.cycle?.ideaSubmissionClosesAt ?? null,
        interactionClosesAt: idea.cycle?.interactionClosesAt ?? null,
        cycleStatus: idea.cycle?.status ?? null,
      })),
      total,
    };
  }

  /**
   * Get a single own idea with full details for viewing/editing.
   * Includes cycle categories (for edit form dropdown) and closure dates.
   */
  async findOwnIdea(ideaId: string, userId: string) {
    const idea = await this.prisma.idea.findFirst({
      where: { id: ideaId, submittedById: userId },
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
        _count: { select: { comments: true, views: true } },
        cycle: {
          select: {
            status: true,
            ideaSubmissionClosesAt: true,
            interactionClosesAt: true,
            cycleCategories: {
              select: { category: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });
    if (!idea) throw new NotFoundException('Idea not found.');

    const mapped = this.mapIdeaToResponse(idea, userId);
    return {
      ...mapped,
      cycleStatus: idea.cycle?.status ?? null,
      submissionClosesAt: idea.cycle?.ideaSubmissionClosesAt ?? null,
      interactionClosesAt: idea.cycle?.interactionClosesAt ?? null,
      categories: idea.cycle?.cycleCategories.map((cc) => cc.category) ?? [],
    };
  }

  /**
   * Update own idea text fields. STAFF only, ownership verified.
   * Blocked when cycle is not ACTIVE or submission closure date has passed.
   */
  async updateOwnIdea(ideaId: string, userId: string, body: UpdateIdeaBody) {
    const idea = await this.ensureOwnIdea(ideaId, userId);

    if (!idea.cycle) {
      throw new BadRequestException(
        'Editing is no longer available. The proposal cycle no longer exists.',
      );
    }
    if (idea.cycle.status !== STATUS_ACTIVE) {
      throw new BadRequestException(
        'Editing is no longer available. The proposal cycle has closed.',
      );
    }
    if (new Date() >= idea.cycle.ideaSubmissionClosesAt) {
      throw new BadRequestException(
        'Editing is no longer available. The submission period has closed.',
      );
    }

    // Category must belong to the cycle
    if (idea.cycleId) {
      const categoryInCycle = await this.prisma.cycleCategory.findFirst({
        where: { cycleId: idea.cycleId, categoryId: body.categoryId },
        select: { id: true },
      });
      if (!categoryInCycle) {
        throw new BadRequestException(
          'The selected category is not available for this proposal cycle.',
        );
      }
    }

    // Title uniqueness within the cycle (excluding self)
    const trimmedTitle = body.title.trim();
    if (idea.cycleId) {
      const duplicate = await this.prisma.idea.findFirst({
        where: {
          cycleId: idea.cycleId,
          title: { equals: trimmedTitle, mode: 'insensitive' },
          id: { not: ideaId },
        },
        select: { id: true },
      });
      if (duplicate) {
        throw new BadRequestException(
          'A proposal with this title already exists in this proposal cycle.',
        );
      }
    }

    await this.prisma.idea.update({
      where: { id: ideaId },
      data: {
        title: body.title,
        description: body.description,
        categoryId: body.categoryId,
        isAnonymous: body.isAnonymous,
      },
    });

    return this.findOwnIdea(ideaId, userId);
  }

  /**
   * Delete own idea. STAFF only, ownership verified.
   * Blocked when cycle is not ACTIVE or submission closure date has passed (same as edit).
   * Cascade: comments, votes, attachments are deleted via Prisma; Cloudinary cleaned up.
   */
  async deleteOwnIdea(ideaId: string, userId: string): Promise<void> {
    const idea = await this.ensureOwnIdea(ideaId, userId);

    if (!idea.cycle) {
      throw new BadRequestException(
        'Deletion is no longer available. The proposal cycle no longer exists.',
      );
    }
    if (idea.cycle.status !== STATUS_ACTIVE) {
      throw new BadRequestException(
        'Deletion is no longer available. The proposal cycle has closed.',
      );
    }
    if (new Date() >= idea.cycle.ideaSubmissionClosesAt) {
      throw new BadRequestException(
        'Deletion is no longer available. The submission period has closed.',
      );
    }

    const publicIds = idea.attachments.map((a) => a.cloudinaryPublicId);
    if (publicIds.length > 0 && this.cloudinary.isConfigured()) {
      try {
        await this.cloudinary.deleteResources(publicIds, 'raw');
      } catch {
        // best‑effort; orphans can be cleaned later
      }
    }

    await this.prisma.idea.delete({ where: { id: ideaId } });
  }

  /**
   * Add an attachment to own idea. STAFF only, ownership verified.
   * Blocked when cycle is not ACTIVE or submission closure has passed. Max 10 attachments per idea.
   */
  async addAttachmentToOwnIdea(
    ideaId: string,
    userId: string,
    body: AddAttachmentBody,
  ) {
    const idea = await this.ensureOwnIdea(ideaId, userId);

    if (!idea.cycle) {
      throw new BadRequestException(
        'Document management is no longer available. The proposal cycle no longer exists.',
      );
    }
    if (idea.cycle.status !== STATUS_ACTIVE) {
      throw new BadRequestException(
        'Document management is no longer available. The proposal cycle has closed.',
      );
    }
    if (new Date() >= idea.cycle.ideaSubmissionClosesAt) {
      throw new BadRequestException(
        'Document management is no longer available. The submission period has closed.',
      );
    }

    const count = await this.prisma.ideaAttachment.count({ where: { ideaId } });
    if (count >= 10) {
      throw new BadRequestException('Maximum 10 attachments allowed per idea.');
    }

    await this.prisma.ideaAttachment.create({
      data: {
        ideaId,
        cloudinaryPublicId: body.cloudinaryPublicId,
        secureUrl: body.secureUrl,
        fileName: body.fileName,
        mimeType: body.mimeType ?? null,
        sizeBytes: body.sizeBytes ?? null,
      },
    });

    return this.findOwnIdea(ideaId, userId);
  }

  /**
   * Remove an attachment from own idea. STAFF only, ownership verified.
   * Blocked when cycle is not ACTIVE or submission closure has passed. Cleans up Cloudinary resource.
   */
  async removeAttachmentFromOwnIdea(
    ideaId: string,
    userId: string,
    attachmentId: string,
  ) {
    const idea = await this.ensureOwnIdea(ideaId, userId);

    if (!idea.cycle) {
      throw new BadRequestException(
        'Document management is no longer available. The proposal cycle no longer exists.',
      );
    }
    if (idea.cycle.status !== STATUS_ACTIVE) {
      throw new BadRequestException(
        'Document management is no longer available. The proposal cycle has closed.',
      );
    }
    if (new Date() >= idea.cycle.ideaSubmissionClosesAt) {
      throw new BadRequestException(
        'Document management is no longer available. The submission period has closed.',
      );
    }

    const attachment = await this.prisma.ideaAttachment.findFirst({
      where: { id: attachmentId, ideaId },
      select: { id: true, cloudinaryPublicId: true },
    });
    if (!attachment) throw new NotFoundException('Attachment not found.');

    if (this.cloudinary.isConfigured()) {
      try {
        await this.cloudinary.deleteResources(
          [attachment.cloudinaryPublicId],
          'raw',
        );
      } catch {
        // best‑effort
      }
    }

    await this.prisma.ideaAttachment.delete({ where: { id: attachmentId } });

    return this.findOwnIdea(ideaId, userId);
  }
}
