import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../constants/roles';

export const REQUIRED_PERMISSION_KEY = 'requiredPermission';

/**
 * RBAC: require one of the given permissions (resolved via role table).
 * Use with PermissionsGuard. Example: @RequirePermission('USERS')
 */
export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(REQUIRED_PERMISSION_KEY, permissions);
