import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { CreateDepartmentBody } from './dto/create-department.dto';
import type { UpdateDepartmentBody } from './dto/update-department.dto';

function isPrismaNotFound(e: unknown): boolean {
  return (
    e != null &&
    typeof e === 'object' &&
    (e as { code?: string }).code === 'P2025'
  );
}

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateDepartmentBody): Promise<{ id: string; name: string }> {
    const existing = await this.prisma.department.findFirst({
      where: { name: { equals: body.name, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Department with this name already exists');
    }
    const department = await this.prisma.department.create({
      data: { name: body.name },
      select: { id: true, name: true },
    });
    return department;
  }

  async update(
    id: string,
    body: UpdateDepartmentBody,
  ): Promise<{ id: string; name: string }> {
    try {
      const department = await this.prisma.department.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
        },
        select: { id: true, name: true },
      });
      return department;
    } catch (e) {
      if (isPrismaNotFound(e)) {
        throw new NotFoundException('Department not found');
      }
      throw e;
    }
  }

  async findAll(): Promise<Array<{ id: string; name: string }>> {
    const list = await this.prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return list;
  }
}
