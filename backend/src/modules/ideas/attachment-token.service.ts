import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

const ATTACHMENT_TOKEN_EXPIRY = '24h';

export interface AttachmentTokenPayload {
  sub: string; // attachmentId
  disp: 'inline' | 'attachment'; // Content-Disposition
}

@Injectable()
export class AttachmentTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  sign(payload: AttachmentTokenPayload): string {
    return this.jwt.sign(
      { ...payload, purpose: 'attachment-access' } as object,
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: ATTACHMENT_TOKEN_EXPIRY,
      },
    );
  }

  verify(token: string): AttachmentTokenPayload | null {
    try {
      const decoded = this.jwt.verify<AttachmentTokenPayload & { purpose?: string }>(
        token,
        { secret: this.config.get<string>('JWT_SECRET') },
      );
      if (decoded?.purpose !== 'attachment-access' || !decoded.sub) return null;
      return {
        sub: decoded.sub,
        disp: decoded.disp === 'attachment' ? 'attachment' : 'inline',
      };
    } catch {
      return null;
    }
  }
}
