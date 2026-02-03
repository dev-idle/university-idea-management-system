import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MeService, type MeProfile } from './me.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/auth.types';
import { changePasswordBodySchema } from './dto/change-password.dto';
import { updateProfileBodySchema } from './dto/update-profile.dto';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  /**
   * GET /me — Auth required. userId from access token only; never from client.
   * Returns only safe fields: id, email, fullName, role, department.
   */
  @Get()
  getProfile(@CurrentUser() payload: AccessTokenPayload): Promise<MeProfile> {
    return this.meService.getProfile(payload.sub);
  }

  /**
   * PATCH /me — Auth required. Only fullName is editable.
   */
  @Patch()
  updateProfile(
    @CurrentUser() payload: AccessTokenPayload,
    @Body(new ZodValidationPipe(updateProfileBodySchema))
    body: { fullName?: string | null },
  ): Promise<MeProfile> {
    return this.meService.updateProfile(payload.sub, body);
  }

  /**
   * PATCH /me/password — Auth required. Verify current, hash new, invalidate refresh tokens.
   */
  @Patch('password')
  updatePassword(
    @CurrentUser() payload: AccessTokenPayload,
    @Body(new ZodValidationPipe(changePasswordBodySchema))
    body: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    return this.meService.updatePassword(
      payload.sub,
      body.currentPassword,
      body.newPassword,
    );
  }
}
