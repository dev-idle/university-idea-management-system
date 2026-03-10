import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AccessTokenPayload } from '../auth.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RBAC guard: backend-only, untrusted. Checks JWT payload roles (set at login).
 * Use with @Roles('admin', 'user').
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) return true;

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: AccessTokenPayload }>();
    if (!user?.roles) {
      throw new ForbiddenException('Forbidden');
    }
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Forbidden');
    }
    return true;
  }
}
