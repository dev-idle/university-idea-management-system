import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard for access token (Bearer). Use on /auth/me and any protected route. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
