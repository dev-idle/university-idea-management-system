/** JWT payload for access token (short-term, JSON response). */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  type: 'access';
}

/** JWT payload for refresh token (long-term, HttpOnly cookie). */
export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

/** User shape returned in login and /me (no password). */
export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}
