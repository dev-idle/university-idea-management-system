import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isPrismaNotFound } from '../../common/utils/prisma-errors.util';
import type { CreateCategoryBody } from './dto/create-category.dto';
import type { UpdateCategoryBody } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateCategoryBody): Promise<{ id: string; name: string }> {
    const existing = await this.prisma.category.findFirst({
      where: { name: { equals: body.name, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }
    const category = await this.prisma.category.create({
      data: { name: body.name },
      select: { id: true, name: true },
    });
    return category;
  }

  async update(
    id: string,
    body: UpdateCategoryBody,
  ): Promise<{ id: string; name: string }> {
    if (body.name !== undefined) {
      const existing = await this.prisma.category.findFirst({
        where: {
          name: { equals: body.name, mode: 'insensitive' },
          id: { not: id },
        },
        select: { id: true },
      });
      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
        },
        select: { id: true, name: true },
      });
      return category;
    } catch (e) {
      if (isPrismaNotFound(e)) {
        throw new NotFoundException('Category not found');
      }
      throw e;
    }
  }

  async findAll(): Promise<
    Array<{ id: string; name: string; _count: { ideas: number; cycleCategories: number } }>
  > {
    const list = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { ideas: true, cycleCategories: true } },
      },
      orderBy: { name: 'asc' },
    });
    return list;
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, _count: { select: { ideas: true, cycleCategories: true } } },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category._count.ideas > 0 || category._count.cycleCategories > 0) {
      throw new ConflictException(
        'Cannot delete category that is used in submission cycles or by ideas. Remove or reassign first.',
      );
    }
    await this.prisma.category.delete({
      where: { id },
    });
  }
}
