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
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { loginBodySchema } from './dto/login.dto';
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginBodySchema))
    body: { email: string; password: string },
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<{ accessToken: string; user: AuthUser }> {
    const result = await this.authService.login(body.email, body.password);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

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
