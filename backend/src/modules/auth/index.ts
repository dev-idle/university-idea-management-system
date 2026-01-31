/** Public API: only the module is exported. */
export { AuthModule } from './auth.module';
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { RolesGuard } from './guards/roles.guard';
export { PermissionsGuard } from './guards/permissions.guard';
export { Roles } from './decorators/roles.decorator';
export { RequirePermission } from './decorators/require-permission.decorator';
export { CurrentUser } from './decorators/current-user.decorator';
export {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSION_TABLE,
  isRole,
  getRolesWithPermission,
  hasPermission,
} from './constants/roles';
export type { Role, Permission } from './constants/roles';
export type { AuthUser } from './auth.types';
