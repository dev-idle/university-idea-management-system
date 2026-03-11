import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { loginBodySchema } from './dto/login.dto';
import { forgotPasswordBodySchema } from './dto/forgot-password.dto';
import { resetPasswordBodySchema } from './dto/reset-password.dto';
import type { AccessTokenPayload, AuthUser } from './auth.types';
import { getAuthCookiePath } from '../../config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private get isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }

  private get authPath(): string {
    return getAuthCookiePath(
      this.config.get<string>('API_PREFIX') ?? 'api',
      this.config.get<string>('API_VERSION') ?? '1',
    );
  }

  /** Throttle: 15 attempts per minute. */
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginBodySchema))
    body: {
      email: string;
      password: string;
    },
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<{ accessToken: string; user: AuthUser }> {
    const result = await this.authService.login(body.email, body.password);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  /** OWASP: rate limit 20/15min to prevent flooding user inbox. */
  @Throttle({ default: { limit: 20, ttl: 15 * 60_000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordBodySchema))
    body: {
      email: string;
    },
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(body.email);
  }

  /** OWASP: rate limit to prevent token brute-force. */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordBodySchema))
    body: {
      token: string;
      newPassword: string;
    },
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const token = req.cookies?.[this.authService.cookieName] as
      | string
      | undefined;
    const result = await this.authService.refresh(token ?? '');
    if (result.refreshToken != null) {
      this.setRefreshCookie(res, result.refreshToken);
    }
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    const token = req.cookies?.[this.authService.cookieName] as
      | string
      | undefined;
    await this.authService.logout(token);
    this.clearRefreshCookie(res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() payload: AccessTokenPayload) {
    return this.authService.me(payload);
  }

  /** HttpOnly, Secure (in production), SameSite=Strict, path-scoped to auth routes. */
  private setRefreshCookie(res: express.Response, token: string): void {
    res.cookie(this.authService.cookieName, token, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      maxAge: this.authService.cookieMaxAgeMs,
      path: this.authPath,
    });
  }

  private clearRefreshCookie(res: express.Response): void {
    res.clearCookie(this.authService.cookieName, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: this.authPath,
    });
  }
}
