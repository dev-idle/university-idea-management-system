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
  fullName: true,
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
    fullName: string | null;
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
    const dept = await this.prisma.department.findUnique({
      where: { id: body.departmentId },
      select: { id: true },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    if (body.role === 'QA_COORDINATOR') {
      const qaCoordinatorRole = await this.prisma.role.findUnique({
        where: { name: 'QA_COORDINATOR' },
        select: { id: true },
      });
      if (qaCoordinatorRole) {
        const existing = await this.prisma.user.count({
          where: {
            roleId: qaCoordinatorRole.id,
            departmentId: body.departmentId,
          },
        });
        if (existing > 0) {
          throw new ConflictException(
            'This department already has a QA Coordinator. Each department can have only one.',
          );
        }
      }
    }
    const passwordHash = await hashPassword(body.password);
    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        fullName: body.fullName ?? null,
        passwordHash,
        roleId: role.id,
        departmentId: body.departmentId,
      },
      select: userSelect,
    });
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.role ? [user.role.name] : [],
      isActive: user.isActive,
      departmentId: user.departmentId,
      department: user.department,
    };
  }

  async update(
    id: string,
    body: UpdateUserBody,
  ): Promise<{
    id: string;
    email: string;
    fullName: string | null;
    roles: string[];
    isActive: boolean;
    departmentId: string | null;
    department: { id: string; name: string } | null;
  }> {
    const data: {
      isActive?: boolean;
      fullName?: string | null;
      passwordHash?: string;
    } = {};
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.fullName !== undefined) data.fullName = body.fullName ?? null;
    if (body.newPassword != null && body.newPassword !== '') {
      data.passwordHash = await hashPassword(body.newPassword);
    }
    if (Object.keys(data).length === 0) {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: userSelect,
      });
      if (!user) throw new NotFoundException('User not found');
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.role ? [user.role.name] : [],
        isActive: user.isActive,
        departmentId: user.departmentId,
        department: user.department,
      };
    }
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
        select: userSelect,
      });
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.role ? [user.role.name] : [],
        isActive: user.isActive,
        departmentId: user.departmentId,
        department: user.department,
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
      fullName: string | null;
      roles: string[];
      isActive: boolean;
      departmentId: string | null;
      department: { id: string; name: string } | null;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;
    const term = search?.trim();
    const where = term
      ? {
          OR: [
            { email: { contains: term, mode: 'insensitive' as const } },
            { fullName: { contains: term, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = rows.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      roles: u.role ? [u.role.name] : [],
      isActive: u.isActive,
      departmentId: u.departmentId,
      department: u.department,
    }));

    return { data, total, page, limit };
  }
}
