import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isPrismaNotFound } from '../../common/utils/prisma-errors.util';
import type { CreateDepartmentBody } from './dto/create-department.dto';
import type { UpdateDepartmentBody } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    body: CreateDepartmentBody,
  ): Promise<{ id: string; name: string }> {
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
    if (body.name !== undefined) {
      const existing = await this.prisma.department.findFirst({
        where: {
          name: { equals: body.name, mode: 'insensitive' },
          id: { not: id },
        },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException('Department with this name already exists');
      }
    }
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

  async findAll(): Promise<
    Array<{ id: string; name: string; _count: { users: number } }>
  > {
    const list = await this.prisma.department.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
    return list;
  }

  async remove(id: string): Promise<void> {
    const userCount = await this.prisma.user.count({
      where: { departmentId: id },
    });
    if (userCount > 0) {
      throw new BadRequestException(
        'Cannot delete department that has users assigned. Reassign or remove users first.',
      );
    }
    try {
      await this.prisma.department.delete({
        where: { id },
      });
    } catch (e) {
      if (isPrismaNotFound(e)) {
        throw new NotFoundException('Department not found');
      }
      throw e;
    }
  }
}
