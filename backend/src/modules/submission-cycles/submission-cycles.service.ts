import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isPrismaNotFound } from '../../common/utils/prisma-errors.util';
import type { CycleStatus } from './constants';
import { DEFAULT_INTERACTION_DAYS } from './dto/create-cycle.dto';
import type { CreateCycleBody } from './dto/create-cycle.dto';
import type { UpdateCycleBody } from './dto/update-cycle.dto';

const STATUS_DRAFT = 'DRAFT';
const STATUS_ACTIVE = 'ACTIVE';
const STATUS_CLOSED = 'CLOSED';

/** Comments and votes close at the same time; default 14 days after idea submission close. */
function defaultInteractionClosesAt(ideaSubmissionClosesAt: Date): Date {
  const d = new Date(ideaSubmissionClosesAt);
  d.setDate(d.getDate() + DEFAULT_INTERACTION_DAYS);
  return d;
}

@Injectable()
export class SubmissionCyclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateCycleBody) {
    const interactionClosesAt =
      body.interactionClosesAt ?? defaultInteractionClosesAt(body.ideaSubmissionClosesAt);
    if (interactionClosesAt <= body.ideaSubmissionClosesAt) {
      throw new BadRequestException(
        'Comments & votes close must be after idea submission closure',
      );
    }
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: body.academicYearId },
      select: { id: true },
    });
    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }
    const existingByName = await this.prisma.ideaSubmissionCycle.findFirst({
      where: { name: body.name },
      select: { id: true },
    });
    if (existingByName) {
      throw new ConflictException('A submission cycle with this name already exists.');
    }
    const cycle = await this.prisma.ideaSubmissionCycle.create({
      data: {
        academicYearId: body.academicYearId,
        name: body.name,
        ideaSubmissionClosesAt: body.ideaSubmissionClosesAt,
        interactionClosesAt,
        status: STATUS_DRAFT,
        cycleCategories: {
          create: body.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      select: this.cycleSelect(),
    });
    return this.mapCycle(cycle);
  }

  async listAcademicYearsForCycle() {
    const list = await this.prisma.academicYear.findMany({
      select: { id: true, name: true, startDate: true, endDate: true },
      orderBy: { startDate: 'desc' },
    });
    return list;
  }

  async findAll() {
    const now = new Date();
    await this.prisma.ideaSubmissionCycle.updateMany({
      where: {
        status: STATUS_ACTIVE,
        interactionClosesAt: { lte: now },
      },
      data: { status: STATUS_CLOSED, wasEverClosed: true },
    });
    const list = await this.prisma.ideaSubmissionCycle.findMany({
      select: this.cycleSelect(),
      orderBy: { createdAt: 'desc' },
    });
    return list.map((c) => this.mapCycle(c));
  }

  async findOne(id: string) {
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id },
      select: this.cycleSelect(),
    });
    if (!cycle) {
      throw new NotFoundException('Submission cycle not found');
    }
    const now = new Date();
    if (
      cycle.status === STATUS_ACTIVE &&
      cycle.interactionClosesAt <= now
    ) {
      const updated = await this.prisma.ideaSubmissionCycle.update({
        where: { id },
        data: { status: STATUS_CLOSED, wasEverClosed: true },
        select: this.cycleSelect(),
      });
      return this.mapCycle(updated);
    }
    return this.mapCycle(cycle);
  }

  async update(id: string, body: UpdateCycleBody) {
    const existing = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id },
      select: { id: true, status: true, isLocked: true, _count: { select: { ideas: true } } },
    });
    if (!existing) {
      throw new NotFoundException('Submission cycle not found');
    }
    const hasIdeas = (existing._count?.ideas ?? 0) >= 1;
    const isClosedDisplay = existing.status === STATUS_CLOSED || (existing.status === STATUS_DRAFT && hasIdeas);
    if (existing.status !== STATUS_DRAFT && existing.status !== STATUS_ACTIVE && existing.status !== STATUS_CLOSED) {
      throw new BadRequestException('Cycle cannot be updated');
    }
    if (existing.status === STATUS_CLOSED && existing.isLocked) {
      throw new BadRequestException('Locked cycles cannot be edited. Unlock first.');
    }
    if (isClosedDisplay && existing.status === STATUS_DRAFT && existing.isLocked) {
      throw new BadRequestException('Locked cycles cannot be edited. Unlock first.');
    }
    if (body.name !== undefined) {
      const duplicateByName = await this.prisma.ideaSubmissionCycle.findFirst({
        where: { name: body.name, id: { not: id } },
        select: { id: true },
      });
      if (duplicateByName) {
        throw new ConflictException('A submission cycle with this name already exists.');
      }
    }
    const interactionClosesAt =
      body.interactionClosesAt ??
      (body.ideaSubmissionClosesAt
        ? defaultInteractionClosesAt(body.ideaSubmissionClosesAt)
        : undefined);
    try {
      const cycle = await this.prisma.ideaSubmissionCycle.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name.trim() }),
          ...(body.ideaSubmissionClosesAt !== undefined && {
            ideaSubmissionClosesAt: body.ideaSubmissionClosesAt,
          }),
          ...(interactionClosesAt !== undefined && { interactionClosesAt }),
          ...(body.categoryIds !== undefined && {
            cycleCategories: {
              deleteMany: {},
              create: body.categoryIds.map((categoryId) => ({ categoryId })),
            },
          }),
        },
        select: this.cycleSelect(),
      });
      return this.mapCycle(cycle);
    } catch (e) {
      if (isPrismaNotFound(e)) {
        throw new NotFoundException('Submission cycle not found');
      }
      throw e;
    }
  }

  async activate(id: string) {
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        isLocked: true,
        interactionClosesAt: true,
        academicYearId: true,
        academicYear: { select: { isActive: true } },
        _count: { select: { ideas: true } },
      },
    });
    if (!cycle) {
      throw new NotFoundException('Submission cycle not found');
    }
    if (cycle.status !== STATUS_DRAFT && cycle.status !== STATUS_CLOSED) {
      throw new BadRequestException('Only DRAFT or CLOSED cycles can be activated');
    }
    if (cycle.status === STATUS_CLOSED && cycle.isLocked) {
      throw new BadRequestException('Locked cycles cannot be activated. Unlock first.');
    }
    const hasIdeas = (cycle._count?.ideas ?? 0) >= 1;
    if (cycle.status === STATUS_DRAFT && hasIdeas && cycle.isLocked) {
      throw new BadRequestException('Locked cycles cannot be activated. Unlock first.');
    }
    const now = new Date();
    if (cycle.interactionClosesAt <= now) {
      throw new BadRequestException(
        'Cannot activate: votes and comments period has ended.',
      );
    }
    if (!cycle.academicYear?.isActive) {
      throw new BadRequestException(
        "The cycle's academic year is not active. An Admin must set the academic year to Active in Academic Years first.",
      );
    }
    const otherActive = await this.prisma.ideaSubmissionCycle.findFirst({
      where: { status: STATUS_ACTIVE },
      select: { id: true },
    });
    if (otherActive && otherActive.id !== id) {
      throw new ConflictException(
        'Another submission cycle is already active. Only one cycle can be active at a time.',
      );
    }
    // When reactivating from CLOSED, ensure wasEverClosed=true so UI shows Edit+Lock correctly.
    const data: { status: string; wasEverClosed?: boolean } = { status: STATUS_ACTIVE };
    if (cycle.status === STATUS_CLOSED) {
      data.wasEverClosed = true;
    }
    const updated = await this.prisma.ideaSubmissionCycle.update({
      where: { id },
      data,
      select: this.cycleSelect(),
    });
    return this.mapCycle(updated);
  }

  async close(id: string) {
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id },
      select: { id: true, status: true, interactionClosesAt: true },
    });
    if (!cycle) {
      throw new NotFoundException('Submission cycle not found');
    }
    if (cycle.status !== STATUS_ACTIVE) {
      throw new BadRequestException('Only ACTIVE cycles can be closed');
    }
    if (cycle.interactionClosesAt > new Date()) {
      throw new BadRequestException(
        'Cannot close cycle before comments & votes closure time has passed',
      );
    }
    const updated = await this.prisma.ideaSubmissionCycle.update({
      where: { id },
      data: { status: STATUS_CLOSED, wasEverClosed: true },
      select: this.cycleSelect(),
    });
    return this.mapCycle(updated);
  }

  /** Revert ACTIVE cycle to DRAFT. Only one ACTIVE at a time is relaxed after deactivate. */
  async deactivate(id: string) {
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!cycle) {
      throw new NotFoundException('Submission cycle not found');
    }
    if (cycle.status !== STATUS_ACTIVE) {
      throw new BadRequestException('Only ACTIVE cycles can be deactivated');
    }
    const updated = await this.prisma.ideaSubmissionCycle.update({
      where: { id },
      data: { status: STATUS_DRAFT },
      select: this.cycleSelect(),
    });
    return this.mapCycle(updated);
  }

  /** Delete cycle. Only DRAFT or CLOSED cycles can be deleted; ACTIVE cycles must be deactivated first. */
  async remove(id: string) {
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!cycle) {
      throw new NotFoundException('Submission cycle not found');
    }
    if (cycle.status === STATUS_ACTIVE) {
      throw new BadRequestException(
        'Cannot delete an ACTIVE cycle. Deactivate it first.',
      );
    }
    await this.prisma.ideaSubmissionCycle.delete({
      where: { id },
    });
  }

  private cycleSelect() {
    return {
      id: true,
      academicYearId: true,
      name: true,
      ideaSubmissionClosesAt: true,
      interactionClosesAt: true,
      status: true,
      isLocked: true,
      wasEverClosed: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { ideas: true } },
      academicYear: {
        select: { id: true, name: true, startDate: true, endDate: true, isActive: true },
      },
      cycleCategories: {
        select: {
          categoryId: true,
          category: { select: { id: true, name: true } },
        },
      },
    };
  }

  private mapCycle(
    row: {
      id: string;
      academicYearId: string;
      name: string | null;
      ideaSubmissionClosesAt: Date;
      interactionClosesAt: Date;
      status: string;
      isLocked: boolean;
      wasEverClosed: boolean;
      createdAt: Date;
      updatedAt: Date;
      _count: { ideas: number };
      academicYear: { id: string; name: string; startDate: Date; endDate: Date | null; isActive: boolean };
      cycleCategories: Array<{
        categoryId: string;
        category: { id: string; name: string };
      }>;
    },
  ) {
    return {
      id: row.id,
      academicYearId: row.academicYearId,
      name: row.name,
      ideaSubmissionClosesAt: row.ideaSubmissionClosesAt,
      interactionClosesAt: row.interactionClosesAt,
      status: row.status as CycleStatus,
      isLocked: row.isLocked,
      wasEverClosed: row.wasEverClosed,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      _count: row._count,
      academicYear: row.academicYear,
      categories: row.cycleCategories.map((cc) => cc.category),
    };
  }

  /** Lock a CLOSED, DRAFT (with ideas), or ACTIVE (wasEverClosed with ideas) cycle: disables Edit and Activate. */
  async lock(id: string) {
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id },
      select: { id: true, status: true, wasEverClosed: true, _count: { select: { ideas: true } } },
    });
    if (!cycle) {
      throw new NotFoundException('Submission cycle not found');
    }
    const hasIdeas = (cycle._count?.ideas ?? 0) >= 1;
    const canLockCycle =
      cycle.status === STATUS_CLOSED ||
      (cycle.status === STATUS_DRAFT && hasIdeas) ||
      (cycle.status === STATUS_ACTIVE && cycle.wasEverClosed && hasIdeas);
    if (!canLockCycle) {
      throw new BadRequestException(
        'Only closed cycles, deactivated cycles with ideas, or reactivated cycles can be locked',
      );
    }
    return this.prisma.ideaSubmissionCycle
      .update({
        where: { id },
        data: { isLocked: true },
        select: this.cycleSelect(),
      })
      .then((c) => this.mapCycle(c));
  }

  /** Unlock a locked cycle: re-enables Edit and Activate. */
  async unlock(id: string) {
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id },
      select: { id: true, isLocked: true },
    });
    if (!cycle) {
      throw new NotFoundException('Submission cycle not found');
    }
    if (!cycle.isLocked) {
      throw new BadRequestException('Cycle is not locked');
    }
    return this.prisma.ideaSubmissionCycle
      .update({
        where: { id },
        data: { isLocked: false },
        select: this.cycleSelect(),
      })
      .then((c) => this.mapCycle(c));
  }
}
