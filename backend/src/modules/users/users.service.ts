/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument -- Prisma client types */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { hashPassword } from '../../common/crypto/password.util';
import type { CreateUserBody } from './dto/create-user.dto';
import type { UpdateUserBody, ListUsersQuery } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  isActive: true,
  departmentId: true,
  department: { select: { id: true, name: true } },
  role: { select: { name: true } },
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    body: CreateUserBody,
  ): Promise<{
    id: string;
    email: string;
    roles: string[];
    isActive: boolean;
    departmentId: string | null;
    department: { id: string; name: string } | null;
  }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const role = await this.prisma.role.findUnique({
      where: { name: body.role },
      select: { id: true },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (body.departmentId != null) {
      const dept = await this.prisma.department.findUnique({
        where: { id: body.departmentId },
        select: { id: true },
      });
      if (!dept) {
        throw new NotFoundException('Department not found');
      }
    }
    const passwordHash = await hashPassword(body.password);
    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        roleId: role.id,
        departmentId: body.departmentId ?? null,
      },
      select: userSelect,
    });
    return {
      id: user.id,
      email: user.email,
      roles: user.role ? [user.role.name] : [],
      isActive: user.isActive,
      departmentId: user.departmentId,
      department: user.department,
    };
  }

  async updateIsActive(
    id: string,
    body: UpdateUserBody,
  ): Promise<{
    id: string;
    email: string;
    roles: string[];
    isActive: boolean;
    departmentId: string | null;
    department: { id: string; name: string } | null;
  }> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { isActive: body.isActive },
        select: userSelect,
      });
      return {
        ...user,
        roles: user.role ? [user.role.name] : [],
      };
    } catch (e) {
      if (
        e != null &&
        typeof e === 'object' &&
        (e as { code?: string }).code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }

  async findAll(
    query: ListUsersQuery,
  ): Promise<{
    data: Array<{
      id: string;
      email: string;
      roles: string[];
      isActive: boolean;
      departmentId: string | null;
      department: { id: string; name: string } | null;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const data = rows.map((u) => ({
      id: u.id,
      email: u.email,
      roles: u.role ? [u.role.name] : [],
      isActive: u.isActive,
      departmentId: u.departmentId,
      department: u.department,
    }));

    return { data, total, page, limit };
  }
}
