import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { CreateAcademicYearBody } from './dto/create-academic-year.dto';
import type { UpdateAcademicYearBody } from './dto/update-academic-year.dto';

function isPrismaNotFound(e: unknown): boolean {
  return (
    e != null &&
    typeof e === 'object' &&
    (e as { code?: string }).code === 'P2025'
  );
}

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
    const academicYear = await this.prisma.academicYear.create({
      data: {
        name: body.name,
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
            'Cannot change active year: another academic year has an active submission cycle. Deactivate or close that cycle in Submission Cycles (QA Manager) first.',
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
            'Cannot deactivate this academic year while it has an active submission cycle. Deactivate or close the cycle in Submission Cycles (QA Manager) first.',
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
