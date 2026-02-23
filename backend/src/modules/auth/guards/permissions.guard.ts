import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AccessTokenPayload } from '../auth.types';
import { REQUIRED_PERMISSION_KEY } from '../decorators/require-permission.decorator';
import type { Permission } from '../constants/roles';
import { getRolesWithPermission } from '../constants/roles';

/**
 * Permission-based RBAC guard. Resolves required permission(s) from decorator,
 * looks up allowed roles from ROLE_PERMISSION_TABLE, checks JWT payload roles.
 * Zero-trust: only table-defined roles and permissions.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      REQUIRED_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions?.length) return true;

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: AccessTokenPayload }>();
    if (!user?.roles?.length) {
      throw new ForbiddenException('Forbidden');
    }

    const hasAnyPermission = requiredPermissions.some((permission) => {
      const allowedRoles = getRolesWithPermission(permission);
      return user.roles.some((r) =>
        allowedRoles.some((role) => r.toUpperCase() === role),
      );
    });

    if (!hasAnyPermission) {
      throw new ForbiddenException('Forbidden');
    }
    return true;
  }
}
