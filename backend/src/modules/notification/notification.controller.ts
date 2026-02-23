import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationService } from './notification.service';
import type { AccessTokenPayload } from '../auth/auth.types';

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'QA_MANAGER', 'QA_COORDINATOR', 'STAFF')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  list(
    @CurrentUser() payload: AccessTokenPayload,
    @Query('limit') limit?: string,
  ) {
    const limitNum = Math.min(
      Math.abs(parseInt(limit ?? String(DEFAULT_LIMIT), 10)) || DEFAULT_LIMIT,
      MAX_LIMIT,
    );
    return this.notificationService.listForUser(payload.sub, limitNum);
  }

  /**
   * GET /notifications/unread-count — Unread count for bell icon badge.
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() payload: AccessTokenPayload) {
    const count = await this.notificationService.getUnreadCount(payload.sub);
    return { count };
  }

  /**
   * PATCH /notifications/:id/read — Mark as read. RBAC: only recipient can mark.
   */
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() payload: AccessTokenPayload,
  ) {
    await this.notificationService.markAsRead(id, payload.sub);
    return { success: true };
  }
}
