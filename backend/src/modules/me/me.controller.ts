import { Controller, Get, Patch, Body, UseGuards, Query } from '@nestjs/common';
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
  getDepartmentMembers(@CurrentUser() payload: AccessTokenPayload): Promise<{
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
   * GET /me/department-members-qa-manager — QA Manager only. Returns departments (excluding IT Services and
   * Quality Assurance Office) with active QA Coordinator per department. Read-only.
   */
  @Get('department-members-qa-manager')
  @UseGuards(RolesGuard)
  @Roles('QA_MANAGER')
  getDepartmentMembersQaManager(): Promise<
    Array<{
      department: { id: string; name: string };
      qaCoordinator: {
        id: string;
        fullName: string | null;
        email: string;
      } | null;
    }>
  > {
    return this.meService.getDepartmentMembersQaManager();
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
    @Query('cycleId') cycleId?: string,
  ): Promise<{
    totalIdeas: number;
    totalComments: number;
    totalViews: number;
    votesUp: number;
    votesDown: number;
  } | null> {
    return this.meService.getDepartmentStats(payload.sub, cycleId);
  }

  /**
   * GET /me/qa-manager-stats — QA Manager only. Org-wide stats for active year:
   * totalIdeas, totalComments, totalViews, votesUp, votesDown, participatingDepartments.
   * Excludes IT Services and Quality Assurance Office departments.
   * When no active cycle: optional cycleId to show a specific cycle; defaults to cycle with
   * most recent interactionClosesAt and >= 1 idea.
   */
  @Get('qa-manager-stats')
  @UseGuards(RolesGuard)
  @Roles('QA_MANAGER')
  getQaManagerStats(
    @CurrentUser() payload: AccessTokenPayload,
    @Query('cycleId') cycleId?: string,
  ): Promise<{
    totalIdeas: number;
    totalComments: number;
    totalViews: number;
    votesUp: number;
    votesDown: number;
    totalDepartments: number;
  }> {
    return this.meService.getQaManagerStats(payload.sub, cycleId);
  }

  /**
   * GET /me/qa-manager-charts — QA Manager only. Chart data: submission rate per department,
   * ideas over time, ideas per department, ideas by category. Excludes IT Services and QA Office.
   * When no active cycle: optional cycleId to show a specific cycle; defaults to cycle with
   * most recent interactionClosesAt and >= 1 idea.
   */
  @Get('qa-manager-charts')
  @UseGuards(RolesGuard)
  @Roles('QA_MANAGER')
  getQaManagerCharts(
    @CurrentUser() payload: AccessTokenPayload,
    @Query('cycleId') cycleId?: string,
  ): Promise<{
    submissionRatePerDepartment: Array<{
      departmentName: string;
      submittedCount: number;
      totalStaff: number;
      rate: number;
    }>;
    ideasOverTime: Array<{ date: string; dateEnd: string; count: number }>;
    ideasPerDepartment: Array<{ departmentName: string; count: number }>;
    ideasByCategory: Array<{ categoryName: string; count: number }>;
  }> {
    return this.meService.getQaManagerCharts(payload.sub, cycleId);
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
    @Query('cycleId') cycleId?: string,
  ): Promise<{
    ideasByCategory: Array<{ categoryName: string; count: number }>;
    ideasOverTime: Array<{ date: string; count: number }>;
  } | null> {
    return this.meService.getDepartmentCharts(payload.sub, cycleId);
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
