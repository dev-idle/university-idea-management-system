import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(): Promise<
    Array<{
      id: string;
      name: string;
      startDate: Date;
      endDate: Date | null;
      isActive: boolean;
    }>
  > {
    const list = await this.prisma.academicYear.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
      orderBy: { startDate: 'desc' },
    });
    return list;
  }
}
