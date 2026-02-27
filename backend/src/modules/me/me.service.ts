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
