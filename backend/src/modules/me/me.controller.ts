import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MeService, type MeProfile } from './me.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
   * GET /me/department-members — QA Coordinator only. Returns members of the current user's department.
   * Returns null if user has no department.
   */
  @Get('department-members')
  @UseGuards(RolesGuard)
  @Roles('QA_COORDINATOR')
  getDepartmentMembers(
    @CurrentUser() payload: AccessTokenPayload,
  ): Promise<{
    department: { id: string; name: string };
    members: Array<{
      id: string;
      fullName: string | null;
      email: string;
      role: string;
    }>;
  } | null> {
    return this.meService.getDepartmentMembers(payload.sub);
  }

  /**
   * GET /me/department-stats — QA Coordinator only. Returns aggregate stats for ideas from the department
   * in the active academic year: totalIdeas, totalComments, totalViews, votesUp, votesDown.
   * Returns null if user has no department.
   */
  @Get('department-stats')
  @UseGuards(RolesGuard)
  @Roles('QA_COORDINATOR')
  getDepartmentStats(
    @CurrentUser() payload: AccessTokenPayload,
  ): Promise<{
    totalIdeas: number;
    totalComments: number;
    totalViews: number;
    votesUp: number;
    votesDown: number;
  } | null> {
    return this.meService.getDepartmentStats(payload.sub);
  }

  /**
   * GET /me/qa-manager-stats — QA Manager only. Org-wide stats for active year:
   * totalIdeas, totalComments, totalViews, votesUp, votesDown, participatingDepartments.
   * Excludes IT Services and Quality Assurance Office departments.
   */
  @Get('qa-manager-stats')
  @UseGuards(RolesGuard)
  @Roles('QA_MANAGER')
  getQaManagerStats(
    @CurrentUser() payload: AccessTokenPayload,
  ): Promise<{
    totalIdeas: number;
    totalComments: number;
    totalViews: number;
    votesUp: number;
    votesDown: number;
    participatingDepartments: number;
  }> {
    return this.meService.getQaManagerStats(payload.sub);
  }

  /**
   * GET /me/department-charts — QA Coordinator only. Chart data: ideas by category, ideas over time (daily, 30 days before closure).
   * Returns null if user has no department.
   */
  @Get('department-charts')
  @UseGuards(RolesGuard)
  @Roles('QA_COORDINATOR')
  getDepartmentCharts(
    @CurrentUser() payload: AccessTokenPayload,
  ): Promise<{
    ideasByCategory: Array<{ categoryName: string; count: number }>;
    ideasOverTime: Array<{ date: string; count: number }>;
  } | null> {
    return this.meService.getDepartmentCharts(payload.sub);
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
