import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AccessTokenPayload } from '../auth.types';
import { isRole } from '../constants/roles';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const secret =
      config.get<string>('JWT_SECRET') ?? 'change-me-in-production';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: AccessTokenPayload): AccessTokenPayload {
    if (payload?.type !== 'access' || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid access token');
    }
    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((r) => typeof r === 'string' && isRole(r))
      : [];
    return { ...payload, roles };
  }
}
