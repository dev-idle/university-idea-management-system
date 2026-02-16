import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isPrismaNotFound } from '../../common/utils/prisma-errors.util';
import type { CreateAcademicYearBody } from './dto/create-academic-year.dto';
import type { UpdateAcademicYearBody } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    body: CreateAcademicYearBody,
  ): Promise<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
  }> {
    const trimmedName = body.name.trim();
    const existing = await this.prisma.academicYear.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(
        'An academic year with this name already exists.',
      );
    }

    const academicYear = await this.prisma.academicYear.create({
      data: {
        name: trimmedName,
        startDate: body.startDate,
        endDate: body.endDate ?? null,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });
    return academicYear;
  }

  private validateDatesWithinAcademicYear(
    name: string,
    startDate?: Date | null,
    endDate?: Date | null,
  ): void {
    const m = name.trim().match(/^(\d{4})-(\d{4})$/);
    if (!m) return;
    const [startYear, endYear] = [
      parseInt(m[1], 10),
      parseInt(m[2], 10),
    ];
    if (startDate && startDate.getFullYear() !== startYear) {
      throw new BadRequestException(
        `Start date must be in ${startYear}.`,
      );
    }
    if (endDate && endDate.getFullYear() !== endYear) {
      throw new BadRequestException(
        `End date must be in ${endYear}.`,
      );
    }
  }

  async update(
    id: string,
    body: UpdateAcademicYearBody,
  ): Promise<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
  }> {
    const selectFields = {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      isActive: true,
    } as const;

    try {
      const existing = await this.prisma.academicYear.findUnique({
        where: { id },
        select: { name: true, startDate: true, endDate: true },
      });
      if (!existing) {
        throw new NotFoundException('Academic year not found');
      }
      const effectiveName = body.name ?? existing.name;
      const effectiveStart =
        body.startDate !== undefined && body.startDate !== null
          ? body.startDate
          : existing.startDate;
      const effectiveEnd =
        body.endDate !== undefined
          ? body.endDate
          : existing.endDate;
      this.validateDatesWithinAcademicYear(
        effectiveName,
        effectiveStart,
        effectiveEnd,
      );
      if (body.isActive === true) {
        // Before deactivating other years, ensure none has an active submission cycle
        const otherYearsWithActiveCycle =
          await this.prisma.ideaSubmissionCycle.findFirst({
            where: {
              status: 'ACTIVE',
              academicYearId: { not: id },
            },
            select: { academicYearId: true },
          });
        if (otherYearsWithActiveCycle) {
          throw new BadRequestException(
            'Cannot change active year: another academic year has an active proposal cycle. Deactivate or close that cycle in Proposal Cycles (QA Manager) first.',
          );
        }
        const [, updated] = await this.prisma.$transaction([
          this.prisma.academicYear.updateMany({
            where: { id: { not: id } },
            data: { isActive: false },
          }),
          this.prisma.academicYear.update({
            where: { id },
            data: {
              ...(body.name != null && { name: body.name }),
              ...(body.startDate != null && { startDate: body.startDate }),
              ...(body.endDate !== undefined && { endDate: body.endDate }),
              isActive: true,
            },
            select: selectFields,
          }),
        ]);
        return updated;
      }

      if (body.isActive === false) {
        const activeCycleForYear =
          await this.prisma.ideaSubmissionCycle.findFirst({
            where: { academicYearId: id, status: 'ACTIVE' },
            select: { id: true },
          });
        if (activeCycleForYear) {
          throw new BadRequestException(
            'Cannot deactivate this academic year while it has an active proposal cycle. Deactivate or close that cycle in Proposal Cycles (QA Manager) first.',
          );
        }
      }

      const academicYear = await this.prisma.academicYear.update({
        where: { id },
        data: {
          ...(body.name != null && { name: body.name }),
          ...(body.startDate != null && { startDate: body.startDate }),
          ...(body.endDate !== undefined && { endDate: body.endDate }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
        select: selectFields,
      });
      return academicYear;
    } catch (e) {
      if (isPrismaNotFound(e)) {
        throw new NotFoundException('Academic year not found');
      }
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    const year = await this.prisma.academicYear.findUnique({
      where: { id },
      select: {
        isActive: true,
        _count: { select: { ideaSubmissionCycles: true } },
      },
    });
    if (!year) {
      throw new NotFoundException('Academic year not found');
    }
    if (year.isActive) {
      throw new BadRequestException(
        'Cannot delete the active academic year. Deactivate it first, then delete.',
      );
    }
    if (year._count.ideaSubmissionCycles > 0) {
      throw new BadRequestException(
        'Cannot delete this academic year: it has proposal cycles. Remove or reassign them in Proposal Cycles (QA Manager) first.',
      );
    }
    await this.prisma.academicYear.delete({ where: { id } });
  }

  async findAll(): Promise<{
    list: Array<{
      id: string;
      name: string;
      startDate: Date;
      endDate: Date | null;
      isActive: boolean;
      hasActiveSubmissionCycle: boolean;
    }>;
    hasActiveSubmissionCycleInSystem: boolean;
  }> {
    const [list, activeCycleYears] = await Promise.all([
      this.prisma.academicYear.findMany({
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          isActive: true,
        },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.ideaSubmissionCycle.findMany({
        where: { status: 'ACTIVE' },
        select: { academicYearId: true },
      }),
    ]);
    const yearIdsWithActiveCycle = new Set(
      activeCycleYears.map((c) => c.academicYearId),
    );
    const listWithFlags = list.map((year) => ({
      ...year,
      hasActiveSubmissionCycle: yearIdsWithActiveCycle.has(year.id),
    }));
    return {
      list: listWithFlags,
      hasActiveSubmissionCycleInSystem: activeCycleYears.length > 0,
    };
  }
}
