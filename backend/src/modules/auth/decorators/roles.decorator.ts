import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * RBAC: require one of the given roles (from JWT payload, backend-only).
 * Use with RolesGuard. Example: @Roles('admin')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
