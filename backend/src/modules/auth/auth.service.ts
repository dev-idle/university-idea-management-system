import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import type { PrismaClient } from '@generated/prisma';
import { PrismaService } from '../../core/prisma/prisma.service';
import { verifyPassword } from '../../common/crypto/password.util';
import {
  generateResetToken,
  hashToken,
} from '../../common/crypto/token-hash.util';
import { hashPassword } from '../../common/crypto/password.util';
import type {
  AccessTokenPayload,
  AuthUser,
  RefreshTokenPayload,
} from './auth.types';
import { randomUUID } from 'node:crypto';
import { DEFAULT_FRONTEND_URL } from '../notification/constants';

const RESET_TOKEN_EXPIRY_MIN = 15;

/** Typed delegate for passwordResetToken; Prisma generated types don't always resolve for ESLint. */
interface PasswordResetTokenDelegate {
  deleteMany(args: { where: { userId: string } }): Promise<unknown>;
  create(args: {
    data: { userId: string; tokenHash: string; expiresAt: Date };
  }): Promise<unknown>;
  findFirst(args: {
    where: { tokenHash: string };
    select: { id: true; userId: true; expiresAt: true };
  }): Promise<{ id: string; userId: string; expiresAt: Date } | null>;
  delete(args: { where: { id: string } }): Promise<unknown>;
}

@Injectable()
export class AuthService {
  private get db(): PrismaClient {
    return this.prisma;
  }

  private get passwordResetTokens(): PasswordResetTokenDelegate {
    return this.prisma
      .passwordResetToken as unknown as PasswordResetTokenDelegate;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
  ) {}

  get cookieName(): string {
    return this.config.get<string>('COOKIE_REFRESH_NAME') ?? 'refreshToken';
  }

  get cookieMaxAgeMs(): number {
    const days = this.config.get<number>('COOKIE_REFRESH_MAX_AGE_DAYS') ?? 7;
    return days * 24 * 60 * 60 * 1000;
  }

  get refreshExpires(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '7d';
  }

  get accessExpires(): string {
    return this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
  }

  /** Login: validate credentials, issue access (JSON) + refresh (cookie). */
  async login(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    user: AuthUser;
    refreshToken: string;
    refreshExpiresAt: Date;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isActive: true,
        role: { select: { name: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const roleNames = user.role ? [user.role.name] : [];
    if (roleNames.length === 0) {
      throw new UnauthorizedException('User has no role assigned');
    }
    const jti = randomUUID();
    const refreshExpiresAt = new Date(Date.now() + this.cookieMaxAgeMs);
    await this.prisma.refreshToken.create({
      data: {
        tokenId: jti,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
      type: 'access',
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      jti,
      type: 'refresh',
    };
    const accessToken = this.jwt.sign(
      accessPayload as object,
      {
        expiresIn: this.accessExpires,
      } as JwtSignOptions,
    );
    const refreshToken = this.jwt.sign(
      refreshPayload as object,
      {
        expiresIn: this.refreshExpires,
      } as JwtSignOptions,
    );
    return {
      accessToken,
      user: { id: user.id, email: user.email, roles: roleNames },
      refreshToken,
      refreshExpiresAt,
    };
  }

  /** Refresh: validate refresh token from cookie, issue new access and rotate refresh. */
  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    user: AuthUser;
    refreshToken?: string;
    refreshExpiresAt?: Date;
  }> {
    const payload = this.verifyRefreshToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenId: payload.jti },
      select: {
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            role: { select: { name: true } },
          },
        },
      },
    });
    if (!tokenRecord) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId: payload.sub },
      });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken
        .delete({ where: { tokenId: payload.jti } })
        .catch(() => {});
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = tokenRecord.user;
    if (!user.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const roleNames = user.role ? [user.role.name] : [];
    if (roleNames.length === 0) {
      throw new UnauthorizedException('User has no role assigned');
    }
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: roleNames,
      type: 'access',
    };
    const accessToken = this.jwt.sign(
      accessPayload as object,
      {
        expiresIn: this.accessExpires,
      } as JwtSignOptions,
    );
    const newJti = randomUUID();
    const refreshExpiresAt = new Date(Date.now() + this.cookieMaxAgeMs);
    await this.prisma.refreshToken
      .delete({ where: { tokenId: payload.jti } })
      .catch(() => {});
    await this.prisma.refreshToken.create({
      data: {
        tokenId: newJti,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });
    const newRefreshToken = this.jwt.sign(
      { sub: user.id, jti: newJti, type: 'refresh' } as object,
      { expiresIn: this.refreshExpires } as JwtSignOptions,
    );
    return {
      accessToken,
      user: { id: user.id, email: user.email, roles: roleNames },
      refreshToken: newRefreshToken,
      refreshExpiresAt,
    };
  }

  /** Logout: invalidate refresh token (cookie cleared by controller). */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      await this.prisma.refreshToken
        .delete({ where: { tokenId: payload.jti } })
        .catch(() => {});
    } catch {
      // ignore invalid token
    }
  }

  /** Me: return user from validated access payload (no DB). */
  me(payload: AccessTokenPayload): AuthUser {
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }

  /**
   * Forgot password: validate email exists, create token, send reset link.
   * Returns clear feedback: email not found vs. instructions sent.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new BadRequestException(
        'No account found with this email address.',
      );
    }

    await this.passwordResetTokens.deleteMany({
      where: { userId: user.id },
    });
    const rawToken = generateResetToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MIN * 60 * 1000);
    await this.passwordResetTokens.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
    const baseUrl =
      this.config.get<string>('FRONTEND_URL') ?? DEFAULT_FRONTEND_URL;
    const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
    try {
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Reset your password',
        template: 'reset-password',
        context: {
          resetLink,
          expiresInMinutes: RESET_TOKEN_EXPIRY_MIN,
        },
      });
    } catch {
      await this.passwordResetTokens.deleteMany({
        where: { userId: user.id },
      });
      throw new BadRequestException(
        'Failed to send reset email. Please try again later.',
      );
    }

    return {
      message: 'Check your email for instructions to reset your password.',
    };
  }

  /**
   * Reset password: validate token, update password, invalidate sessions.
   * OWASP: single-use token, no auto-login, secure storage.
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const tokenHash = hashToken(token.trim());
    const record = (await this.passwordResetTokens.findFirst({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true },
    })) as { id: string; userId: string; expiresAt: Date } | null;
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset link');
    }
    const passwordHash = await hashPassword(newPassword);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.delete({ where: { id: record.id } });
      await tx.refreshToken.deleteMany({ where: { userId: record.userId } });
    });
    return { message: 'Password reset successfully. Please sign in.' };
  }

  private verifyRefreshToken(token: string): RefreshTokenPayload {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException(
        'Server misconfiguration: JWT_SECRET not set',
      );
    }
    const payload = this.jwt.verify<RefreshTokenPayload>(token, { secret });
    if (payload?.type !== 'refresh' || !payload.jti || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return payload;
  }
}
