/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument -- Prisma client types from generated adapter not fully resolved by ESLint */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { verifyPassword } from '../../common/crypto/password.util';
import type {
  AccessTokenPayload,
  AuthUser,
  RefreshTokenPayload,
} from './auth.types';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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
      include: { role: { select: { name: true } } },
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
      include: { user: { include: { role: { select: { name: true } } } } },
    });
    if (!tokenRecord) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId: payload.sub },
      });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { tokenId: payload.jti } }).catch(() => {});
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

  private verifyRefreshToken(token: string): RefreshTokenPayload {
    const payload = this.jwt.verify<RefreshTokenPayload>(token, {
      secret:
        this.config.get<string>('JWT_SECRET') ?? 'change-me-in-production',
    });
    if (payload?.type !== 'refresh' || !payload.jti || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return payload;
  }
}
