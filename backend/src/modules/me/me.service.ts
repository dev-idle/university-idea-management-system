import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  verifyPassword,
  hashPassword,
} from '../../common/crypto/password.util';
import { EXPORT_EXCLUDED_DEPARTMENT_NAMES } from '../export/export.constants';

/** Safe profile shape: no password, no internal IDs beyond required. */
export interface MeProfile {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  role: string;
  department: { id: string; name: string } | null;
}

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current user profile by ID from JWT (never from client).
   * Returns only safe fields; no ability to view other users.
   */
  async getProfile(userId: string): Promise<MeProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        gender: true,
        dateOfBirth: true,
        role: { select: { name: true } },
        department: { select: { id: true, name: true } },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName ?? null,
      phone: user.phone ?? null,
      address: user.address ?? null,
      gender: user.gender ?? null,
      dateOfBirth: user.dateOfBirth
        ? user.dateOfBirth.toISOString().slice(0, 10)
        : null,
      role: user.role.name,
      department: user.department
        ? { id: user.department.id, name: user.department.name }
        : null,
    };
  }

  /**
   * Update profile: only fullName, phone, address, gender, dateOfBirth are editable.
   * Email, role, department are not updatable here. Phone must be unique.
   */
  async updateProfile(
    userId: string,
    body: {
      fullName?: string | null;
      phone?: string | null;
      address?: string | null;
      gender?: string | null;
      dateOfBirth?: string | null;
    },
  ): Promise<MeProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (body.phone !== undefined && body.phone != null && body.phone !== '') {
      const existing = await this.prisma.user.findFirst({
        where: {
          phone: body.phone,
          id: { not: userId },
        },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException('This phone number is already in use');
      }
    }
    const data: {
      fullName?: string | null;
      phone?: string | null;
      address?: string | null;
      gender?: string | null;
      dateOfBirth?: Date | null;
    } = {};
    if (body.fullName !== undefined) data.fullName = body.fullName;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.address !== undefined) data.address = body.address;
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.dateOfBirth !== undefined) {
      data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }
    await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return this.getProfile(userId);
  }

  /**
   * Get users in the current user's department. Returns null if user has no department.
   * Only returns safe fields: id, fullName, email, role name.
   */
  async getDepartmentMembers(userId: string): Promise<{
    department: { id: string; name: string };
    members: Array<{
      id: string;
      fullName: string | null;
      email: string;
      role: string;
    }>;
  } | null> {
    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        departmentId: true,
        department: { select: { id: true, name: true } },
      },
    });
    if (!me?.departmentId || !me.department) return null;
    const users = await this.prisma.user.findMany({
      where: { departmentId: me.departmentId, isActive: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: { select: { name: true } },
      },
      orderBy: [{ fullName: 'asc' }, { email: 'asc' }],
    });
    const members = users.map((u) => ({
      id: u.id,
      fullName: u.fullName ?? null,
      email: u.email,
      role: u.role.name,
    }));
    // QA Coordinator first, then others by fullName, email
    members.sort((a, b) => {
      const aQc = a.role === 'QA_COORDINATOR' ? 1 : 0;
      const bQc = b.role === 'QA_COORDINATOR' ? 1 : 0;
      if (bQc !== aQc) return bQc - aQc; // QA Coordinator first
      const aName = (a.fullName ?? a.email).toLowerCase();
      const bName = (b.fullName ?? b.email).toLowerCase();
      const cmp = aName.localeCompare(bName);
      return cmp !== 0 ? cmp : a.email.localeCompare(b.email);
    });
    return {
      department: me.department,
      members,
    };
  }

  /**
   * Get departments (excluding IT Services and QA Office) with active QA Coordinator per department.
   * QA Manager only. Read-only.
   */
  async getDepartmentMembersQaManager(): Promise<
    Array<{
      department: { id: string; name: string };
      qaCoordinator: {
        id: string;
        fullName: string | null;
        email: string;
      } | null;
    }>
  > {
    const excludedSet = new Set<string>(EXPORT_EXCLUDED_DEPARTMENT_NAMES);
    const departments = await this.prisma.department.findMany({
      where: { name: { notIn: Array.from(excludedSet) } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    const qaCoordinators = await this.prisma.user.findMany({
      where: {
        isActive: true,
        departmentId: { in: departments.map((d) => d.id) },
        role: { name: 'QA_COORDINATOR' },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        departmentId: true,
      },
    });
    const qcByDept = new Map<string | null, (typeof qaCoordinators)[0]>();
    for (const qc of qaCoordinators) {
      if (qc.departmentId) qcByDept.set(qc.departmentId, qc);
    }

    return departments.map((d) => {
      const qc = qcByDept.get(d.id);
      return {
        department: d,
        qaCoordinator: qc
          ? { id: qc.id, fullName: qc.fullName ?? null, email: qc.email }
          : null,
      };
    });
  }

  /**
   * Get department stats for QA Coordinator: total ideas, comments, views, votes (up/down),
   * submittedCount (staff who submitted ≥1 idea in cycle), totalStaff.
   * Scope: active academic year. Returns null if user has no department.
   */
  async getDepartmentStats(
    userId: string,
    cycleId?: string,
  ): Promise<{
    totalIdeas: number;
    totalComments: number;
    totalViews: number;
    votesUp: number;
    votesDown: number;
    submittedCount: number;
    totalStaff: number;
    activeYearName: string | null;
    cyclesInYearCount: number;
  } | null> {
    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    });
    if (!me?.departmentId) return null;

    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true, name: true },
    });
    const staffWhere = {
      departmentId: me.departmentId,
      isActive: true,
      role: { name: { not: 'QA_COORDINATOR' } },
    };
    if (!activeYear) {
      const totalStaff = await this.prisma.user.count({
        where: staffWhere,
      });
      return {
        totalIdeas: 0,
        totalComments: 0,
        totalViews: 0,
        votesUp: 0,
        votesDown: 0,
        submittedCount: 0,
        totalStaff,
        activeYearName: null,
        cyclesInYearCount: 0,
      };
    }

    const cycles = await this.prisma.ideaSubmissionCycle.findMany({
      where: { academicYearId: activeYear.id },
      select: { id: true, status: true, interactionClosesAt: true },
    });
    const activeCycle = cycles.find((c) => c.status === 'ACTIVE');
    let cycleIds: string[];

    if (activeCycle != null) {
      cycleIds = [activeCycle.id];
    } else {
      const cyclesWithIdeas = await this.prisma.ideaSubmissionCycle.findMany({
        where: {
          academicYearId: activeYear.id,
          ideas: {
            some: {
              submittedBy: {
                departmentId: { not: null },
                department: { name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] } },
              },
            },
          },
        },
        select: { id: true, interactionClosesAt: true },
        orderBy: { interactionClosesAt: 'desc' },
      });
      if (cycleId && cyclesWithIdeas.some((c) => c.id === cycleId)) {
        cycleIds = [cycleId];
      } else {
        cycleIds = cyclesWithIdeas.length > 0 ? [cyclesWithIdeas[0]!.id] : [];
      }
    }

    const cyclesWithIdeasCount = await this.prisma.ideaSubmissionCycle.count({
      where: {
        academicYearId: activeYear.id,
        ideas: {
          some: {
            submittedBy: {
              departmentId: { not: null },
              department: {
                name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] },
              },
            },
          },
        },
      },
    });

    if (cycleIds.length === 0) {
      const totalStaff = await this.prisma.user.count({
        where: staffWhere,
      });
      return {
        totalIdeas: 0,
        totalComments: 0,
        totalViews: 0,
        votesUp: 0,
        votesDown: 0,
        submittedCount: 0,
        totalStaff,
        activeYearName: activeYear.name,
        cyclesInYearCount: cyclesWithIdeasCount,
      };
    }

    const ideaWhere = {
      submittedBy: { departmentId: me.departmentId },
      cycleId: { in: cycleIds },
    };
    const ideaWhereExclQc = {
      submittedBy: {
        departmentId: me.departmentId,
        role: { name: { not: 'QA_COORDINATOR' } },
      },
      cycleId: { in: cycleIds },
    };

    const [totalIdeas, totalComments, totalViews, votesUp, votesDown, submittersGroup, totalStaff] =
      await Promise.all([
        this.prisma.idea.count({ where: ideaWhere }),
        this.prisma.ideaComment.count({
          where: { idea: ideaWhere },
        }),
        this.prisma.ideaView.count({
          where: { idea: ideaWhere },
        }),
        this.prisma.ideaVote.count({
          where: { idea: ideaWhere, value: 'up' },
        }),
        this.prisma.ideaVote.count({
          where: { idea: ideaWhere, value: 'down' },
        }),
        this.prisma.idea.groupBy({
          by: ['submittedById'],
          where: { ...ideaWhereExclQc, submittedById: { not: null } },
        }),
        this.prisma.user.count({
          where: staffWhere,
        }),
      ]);

    const submittedCount = submittersGroup.length;

    return {
      totalIdeas,
      totalComments,
      totalViews,
      votesUp,
      votesDown,
      submittedCount,
      totalStaff,
      activeYearName: activeYear.name,
      cyclesInYearCount: cyclesWithIdeasCount,
    };
  }

  /** Department names excluded from QA Manager stats (internal/admin). */
  private static readonly QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES = [
    'IT Services / System Administration Department',
    'Quality Assurance Office',
  ] as const;

  private static normalizeToStartOfDay(d: Date): Date {
    const out = new Date(d);
    out.setHours(0, 0, 0, 0);
    return out;
  }

  private static normalizeToEndOfDay(d: Date): Date {
    const out = new Date(d);
    out.setHours(23, 59, 59, 999);
    return out;
  }

  /**
   * Build ideas-over-time buckets for chart: window from submission start (academic year) to closure.
   * Buckets are evenly divided, 5–12 buckets based on period length.
   */
  private static buildIdeasOverTimeBuckets(
    windowStart: Date,
    windowEnd: Date,
    createdAts: Date[],
  ): Array<{ date: string; dateEnd: string; count: number }> {
    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.max(
      1,
      Math.ceil((windowEnd.getTime() - windowStart.getTime()) / msPerDay),
    );
    const bucketCount =
      totalDays <= 7
        ? totalDays
        : totalDays <= 14
          ? 7
          : totalDays <= 21
            ? 7
            : totalDays <= 28
              ? 7
              : totalDays <= 35
                ? 7
                : totalDays <= 56
                  ? 8
                  : totalDays <= 84
                    ? 10
                    : 12;
    const daysPerBucket = totalDays / bucketCount;

    const periodCounts = new Map<number, number>();
    for (const createdAt of createdAts) {
      if (createdAt < windowStart || createdAt > windowEnd) continue;
      const msSinceStart = createdAt.getTime() - windowStart.getTime();
      const daysSince = Math.max(0, msSinceStart / msPerDay);
      const periodIndex = Math.min(
        Math.floor(daysSince / daysPerBucket),
        bucketCount - 1,
      );
      periodCounts.set(periodIndex, (periodCounts.get(periodIndex) ?? 0) + 1);
    }

    const out: Array<{ date: string; dateEnd: string; count: number }> = [];
    for (let i = 0; i < bucketCount; i++) {
      const startOffset = Math.floor(i * daysPerBucket);
      const endOffset = Math.min(
        Math.floor((i + 1) * daysPerBucket) - 1,
        totalDays - 1,
      );
      const startDay = new Date(windowStart);
      startDay.setDate(startDay.getDate() + startOffset);
      const endDay = new Date(windowStart);
      endDay.setDate(endDay.getDate() + endOffset);
      const dateKey = `${startDay.getFullYear()}-${String(startDay.getMonth() + 1).padStart(2, '0')}-${String(startDay.getDate()).padStart(2, '0')}`;
      const dateEndKey = `${endDay.getFullYear()}-${String(endDay.getMonth() + 1).padStart(2, '0')}-${String(endDay.getDate()).padStart(2, '0')}`;
      out.push({
        date: dateKey,
        dateEnd: dateEndKey,
        count: periodCounts.get(i) ?? 0,
      });
    }
    return out;
  }

  /**
   * Get QA Manager dashboard stats: total ideas, comments, views, votes (up/down),
   * total departments. Total departments = all departments excluding IT Services and QA Office.
   * Scope: active academic year for ideas/comments/votes.
   * When no active cycle: optional cycleId; defaults to cycle with most recent interactionClosesAt
   * and >= 1 idea (excluding IT/QA departments).
   */
  async getQaManagerStats(
    userId: string,
    cycleId?: string,
  ): Promise<{
    totalIdeas: number;
    totalComments: number;
    totalViews: number;
    votesUp: number;
    votesDown: number;
    totalDepartments: number;
    activeYearName: string | null;
    cyclesInYearCount: number;
  }> {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true, name: true },
    });
    if (!activeYear) {
      const totalDepartments = await this.prisma.department.count({
        where: { name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] } },
      });
      return {
        totalIdeas: 0,
        totalComments: 0,
        totalViews: 0,
        votesUp: 0,
        votesDown: 0,
        totalDepartments,
        activeYearName: null,
        cyclesInYearCount: 0,
      };
    }

    const cycles = await this.prisma.ideaSubmissionCycle.findMany({
      where: { academicYearId: activeYear.id },
      select: { id: true, status: true, interactionClosesAt: true },
    });
    const activeCycle = cycles.find((c) => c.status === 'ACTIVE');
    let cycleIds: string[];

    if (activeCycle != null) {
      cycleIds = [activeCycle.id];
    } else {
      const cyclesWithIdeas = await this.prisma.ideaSubmissionCycle.findMany({
        where: {
          academicYearId: activeYear.id,
          ideas: {
            some: {
              submittedBy: {
                departmentId: { not: null },
                department: { name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] } },
              },
            },
          },
        },
        select: { id: true, interactionClosesAt: true },
        orderBy: { interactionClosesAt: 'desc' },
      });
      if (cycleId && cyclesWithIdeas.some((c) => c.id === cycleId)) {
        cycleIds = [cycleId];
      } else {
        cycleIds = cyclesWithIdeas.length > 0 ? [cyclesWithIdeas[0]!.id] : [];
      }
    }

    const cyclesWithIdeasCount = await this.prisma.ideaSubmissionCycle.count({
      where: {
        academicYearId: activeYear.id,
        ideas: {
          some: {
            submittedBy: {
              departmentId: { not: null },
              department: {
                name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] },
              },
            },
          },
        },
      },
    });

    if (cycleIds.length === 0) {
      const totalDepartments = await this.prisma.department.count({
        where: { name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] } },
      });
      return {
        totalIdeas: 0,
        totalComments: 0,
        totalViews: 0,
        votesUp: 0,
        votesDown: 0,
        totalDepartments,
        activeYearName: activeYear.name,
        cyclesInYearCount: cyclesWithIdeasCount,
      };
    }

    const ideaWhere = {
      cycleId: { in: cycleIds },
      submittedBy: {
        departmentId: { not: null },
        department: {
          name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] },
        },
      },
    };

    const [totalIdeas, totalComments, totalViews, votesUp, votesDown, totalDepartments] =
      await Promise.all([
        this.prisma.idea.count({ where: ideaWhere }),
        this.prisma.ideaComment.count({
          where: { idea: ideaWhere },
        }),
        this.prisma.ideaView.count({
          where: { idea: ideaWhere },
        }),
        this.prisma.ideaVote.count({
          where: { idea: ideaWhere, value: 'up' },
        }),
        this.prisma.ideaVote.count({
          where: { idea: ideaWhere, value: 'down' },
        }),
        this.prisma.department.count({
          where: { name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] } },
        }),
      ]);

    return {
      totalIdeas,
      totalComments,
      totalViews,
      votesUp,
      votesDown,
      totalDepartments,
      activeYearName: activeYear.name,
      cyclesInYearCount: cyclesWithIdeasCount,
    };
  }

  /**
   * Get department chart data for QA Coordinator: ideas by category, ideas over time.
   * Scope: active academic year. Returns null if user has no department.
   */
  async getDepartmentCharts(
    userId: string,
    cycleId?: string,
  ): Promise<{
    ideasByCategory: Array<{ categoryName: string; count: number }>;
    ideasOverTime: Array<{ date: string; dateEnd: string; count: number }>;
    closureDate: string | null;
  } | null> {
    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    });
    if (!me?.departmentId) return null;

    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) {
      return { ideasByCategory: [], ideasOverTime: [], closureDate: null };
    }

    const cycles = await this.prisma.ideaSubmissionCycle.findMany({
      where: { academicYearId: activeYear.id },
      select: {
        id: true,
        ideaSubmissionClosesAt: true,
        interactionClosesAt: true,
        status: true,
      },
      orderBy: { ideaSubmissionClosesAt: 'desc' },
    });
    const activeCycle = cycles.find((c) => c.status === 'ACTIVE');
    let cyclesToUse: typeof cycles;

    if (activeCycle != null) {
      cyclesToUse = [activeCycle];
    } else {
      const cyclesWithIdeas = await this.prisma.ideaSubmissionCycle.findMany({
        where: {
          academicYearId: activeYear.id,
          ideas: {
            some: {
              submittedBy: {
                departmentId: { not: null },
                department: { name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] } },
              },
            },
          },
        },
        select: {
          id: true,
          ideaSubmissionClosesAt: true,
          interactionClosesAt: true,
          status: true,
        },
        orderBy: { interactionClosesAt: 'desc' },
      });
      if (cycleId && cyclesWithIdeas.some((c) => c.id === cycleId)) {
        const picked = cyclesWithIdeas.find((c) => c.id === cycleId);
        cyclesToUse = picked ? [picked] : cyclesWithIdeas.slice(0, 1);
      } else {
        cyclesToUse = cyclesWithIdeas.slice(0, 1);
      }
    }
    const cycleIds = cyclesToUse.map((c) => c.id);
    if (cycleIds.length === 0) {
      return { ideasByCategory: [], ideasOverTime: [], closureDate: null };
    }

    const cycleForClosure = cyclesToUse[0]!;
    const closureDate = cycleForClosure.ideaSubmissionClosesAt;
    const ideaWhereAll = {
      submittedBy: { departmentId: me.departmentId },
      cycleId: { in: cycleIds },
    };

    const [cycleCategories, byCategoryRows, ideasWithDate] = await Promise.all([
      this.prisma.cycleCategory.findMany({
        where: { cycleId: { in: cycleIds } },
        select: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.idea.groupBy({
        by: ['categoryId'],
        where: ideaWhereAll,
        _count: { id: true },
      }),
      this.prisma.idea.findMany({
        where: ideaWhereAll,
        select: { createdAt: true },
      }),
    ]);

    const firstSubmission =
      ideasWithDate.length > 0
        ? new Date(Math.min(...ideasWithDate.map((i) => i.createdAt.getTime())))
        : null;
    const windowStart = firstSubmission
      ? MeService.normalizeToStartOfDay(firstSubmission)
      : MeService.normalizeToStartOfDay(closureDate);
    const windowEnd = MeService.normalizeToEndOfDay(closureDate);

    const countByCategoryId = new Map<string, number>();
    for (const r of byCategoryRows) {
      const key = r.categoryId ?? '__uncategorized__';
      countByCategoryId.set(key, r._count.id);
    }

    const seenCategoryIds = new Set<string>();
    const ideasByCategory: Array<{ categoryName: string; count: number }> = [];
    for (const cc of cycleCategories) {
      const cat = cc.category;
      if (seenCategoryIds.has(cat.id)) continue;
      seenCategoryIds.add(cat.id);
      ideasByCategory.push({
        categoryName: cat.name,
        count: countByCategoryId.get(cat.id) ?? 0,
      });
    }
    ideasByCategory.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    const uncategorizedCount = countByCategoryId.get('__uncategorized__') ?? 0;
    if (uncategorizedCount > 0) {
      ideasByCategory.push({ categoryName: 'Uncategorized', count: uncategorizedCount });
    }

    const ideasOverTime = MeService.buildIdeasOverTimeBuckets(
      windowStart,
      windowEnd,
      ideasWithDate.map((i) => i.createdAt),
    );

    const closureDateStr = closureDate
      ? `${closureDate.getFullYear()}-${String(closureDate.getMonth() + 1).padStart(2, '0')}-${String(closureDate.getDate()).padStart(2, '0')}`
      : null;

    return { ideasByCategory, ideasOverTime, closureDate: closureDateStr };
  }

  /**
   * Get QA Manager chart data: submission rate per department, ideas over time,
   * ideas per department, ideas by category. Excludes IT Services and QA Office.
   * Scope: active academic year.
   * When no active cycle: optional cycleId; defaults to cycle with most recent interactionClosesAt
   * and >= 1 idea (excluding IT/QA departments).
   */
  async getQaManagerCharts(
    userId: string,
    cycleId?: string,
  ): Promise<{
    submissionRatePerDepartment: Array<{
      departmentName: string;
      submittedCount: number;
      totalStaff: number;
      rate: number;
    }>;
    ideasOverTime: Array<{ date: string; dateEnd: string; count: number }>;
    ideasPerDepartment: Array<{ departmentName: string; count: number }>;
    ideasByCategory: Array<{ categoryName: string; count: number }>;
  }> {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeYear) {
      return {
        submissionRatePerDepartment: [],
        ideasOverTime: [],
        ideasPerDepartment: [],
        ideasByCategory: [],
      };
    }

    const cycles = await this.prisma.ideaSubmissionCycle.findMany({
      where: { academicYearId: activeYear.id },
      select: {
        id: true,
        ideaSubmissionClosesAt: true,
        interactionClosesAt: true,
        status: true,
      },
      orderBy: { ideaSubmissionClosesAt: 'desc' },
    });
    const activeCycle = cycles.find((c) => c.status === 'ACTIVE');
    let cyclesToUse: typeof cycles;

    if (activeCycle != null) {
      cyclesToUse = [activeCycle];
    } else {
      const cyclesWithIdeas = await this.prisma.ideaSubmissionCycle.findMany({
        where: {
          academicYearId: activeYear.id,
          ideas: {
            some: {
              submittedBy: {
                departmentId: { not: null },
                department: {
                  name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] },
                },
              },
            },
          },
        },
        select: {
          id: true,
          ideaSubmissionClosesAt: true,
          interactionClosesAt: true,
          status: true,
        },
        orderBy: { interactionClosesAt: 'desc' },
      });
      if (cycleId && cyclesWithIdeas.some((c) => c.id === cycleId)) {
        const picked = cyclesWithIdeas.find((c) => c.id === cycleId);
        cyclesToUse = picked ? [picked] : cyclesWithIdeas.slice(0, 1);
      } else {
        cyclesToUse = cyclesWithIdeas.slice(0, 1);
      }
    }
    const cycleIds = cyclesToUse.map((c) => c.id);
    if (cycleIds.length === 0) {
      return {
        submissionRatePerDepartment: [],
        ideasOverTime: [],
        ideasPerDepartment: [],
        ideasByCategory: [],
      };
    }

    const depts = await this.prisma.department.findMany({
      where: { name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    const deptIds = depts.map((d) => d.id);

    const ideaWhere = {
      cycleId: { in: cycleIds },
      submittedById: { not: null },
      submittedBy: {
        departmentId: { in: deptIds },
        department: {
          name: { notIn: [...MeService.QA_MANAGER_EXCLUDED_DEPARTMENT_NAMES] },
        },
      },
    };

    const cycleForClosure = cyclesToUse[0]!;
    const closureDate = cycleForClosure.ideaSubmissionClosesAt;
    const maxClosure = new Date(
      Math.max(
        ...cyclesToUse.map((c) => c.ideaSubmissionClosesAt.getTime()),
      ),
    );

    const [cycleCategories, ideasForCharts, staffByDept, byCategoryRows] =
      await Promise.all([
        this.prisma.cycleCategory.findMany({
          where: { cycleId: { in: cycleIds } },
          select: { category: { select: { id: true, name: true } } },
        }),
        this.prisma.idea.findMany({
          where: ideaWhere,
          select: {
            submittedById: true,
            submittedBy: {
              select: {
                departmentId: true,
                role: { select: { name: true } },
              },
            },
            createdAt: true,
            categoryId: true,
          },
        }),
        this.prisma.user.groupBy({
          by: ['departmentId'],
          where: {
            departmentId: { in: deptIds },
            isActive: true,
            role: { name: { not: 'QA_COORDINATOR' } },
          },
          _count: { id: true },
        }),
        this.prisma.idea.groupBy({
          by: ['categoryId'],
          where: ideaWhere,
          _count: { id: true },
        }),
      ]);

    // Build submittedCount per department (distinct staff who submitted, excl. QA Coordinator)
    const submittersByDeptId = new Map<string, Set<string>>();
    for (const idea of ideasForCharts) {
      const submitter = idea.submittedBy;
      if (!submitter?.departmentId || submitter.role?.name === 'QA_COORDINATOR') continue;
      const deptId = submitter.departmentId;
      if (!submittersByDeptId.has(deptId)) {
        submittersByDeptId.set(deptId, new Set());
      }
      if (idea.submittedById) {
        submittersByDeptId.get(deptId)!.add(idea.submittedById);
      }
    }

    const staffCountByDept = new Map<string, number>();
    for (const r of staffByDept) {
      if (r.departmentId) staffCountByDept.set(r.departmentId, r._count.id);
    }

    const submissionRatePerDepartment: Array<{
      departmentName: string;
      submittedCount: number;
      totalStaff: number;
      rate: number;
    }> = [];
    for (const dept of depts) {
      const totalStaff = staffCountByDept.get(dept.id) ?? 0;
      const submittedCount = submittersByDeptId.get(dept.id)?.size ?? 0;
      const rate = totalStaff > 0 ? Math.round((submittedCount / totalStaff) * 1000) / 10 : 0;
      submissionRatePerDepartment.push({
        departmentName: dept.name,
        submittedCount,
        totalStaff,
        rate,
      });
    }

    // Ideas per department
    const ideasCountByDept = new Map<string, number>();
    for (const idea of ideasForCharts) {
      const deptId = idea.submittedBy?.departmentId;
      if (!deptId) continue;
      ideasCountByDept.set(deptId, (ideasCountByDept.get(deptId) ?? 0) + 1);
    }
    const ideasPerDepartment = depts.map((d) => ({
      departmentName: d.name,
      count: ideasCountByDept.get(d.id) ?? 0,
    }));

    // Ideas by category
    const countByCategoryId = new Map<string, number>();
    for (const r of byCategoryRows) {
      const key = r.categoryId ?? '__uncategorized__';
      countByCategoryId.set(key, r._count.id);
    }
    const seenCategoryIds = new Set<string>();
    const ideasByCategory: Array<{ categoryName: string; count: number }> = [];
    for (const cc of cycleCategories) {
      const cat = cc.category;
      if (seenCategoryIds.has(cat.id)) continue;
      seenCategoryIds.add(cat.id);
      ideasByCategory.push({
        categoryName: cat.name,
        count: countByCategoryId.get(cat.id) ?? 0,
      });
    }
    ideasByCategory.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    const uncategorizedCount = countByCategoryId.get('__uncategorized__') ?? 0;
    if (uncategorizedCount > 0) {
      ideasByCategory.push({ categoryName: 'Uncategorized', count: uncategorizedCount });
    }

    const firstSubmission =
      ideasForCharts.length > 0
        ? new Date(Math.min(...ideasForCharts.map((i) => i.createdAt.getTime())))
        : null;
    const windowStart = firstSubmission
      ? MeService.normalizeToStartOfDay(firstSubmission)
      : MeService.normalizeToStartOfDay(maxClosure);
    const windowEnd = MeService.normalizeToEndOfDay(maxClosure);

    const ideasOverTime = MeService.buildIdeasOverTimeBuckets(
      windowStart,
      windowEnd,
      ideasForCharts.map((i) => i.createdAt),
    );

    return {
      submissionRatePerDepartment,
      ideasOverTime,
      ideasPerDepartment,
      ideasByCategory,
    };
  }

  /**
   * Update password: verify current, hash new, update, invalidate all refresh tokens.
   * No admin override; no email/role/department updates.
   */
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await hashPassword(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
    ]);
    return { message: 'Password updated successfully' };
  }
}
