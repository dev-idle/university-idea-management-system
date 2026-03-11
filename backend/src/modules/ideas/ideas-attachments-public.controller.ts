import {
  Controller,
  Get,
  Param,
  BadRequestException,
  StreamableFile,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IdeasService } from './ideas.service';
import { AttachmentTokenService } from './attachment-token.service';

/** MIME types that should open in browser (inline). Others use attachment (download). */
const INLINE_MIME_PREFIXES = [
  'application/pdf',
  'image/',
  'text/plain',
  'text/html',
  'text/csv',
];

function isInlineViewable(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return INLINE_MIME_PREFIXES.some((p) => mimeType.startsWith(p));
}

@Controller('ideas')
export class IdeasAttachmentsPublicController {
  private readonly logger = new Logger(IdeasAttachmentsPublicController.name);

  constructor(
    private readonly ideasService: IdeasService,
    private readonly tokenService: AttachmentTokenService,
  ) {}

  /**
   * Public signed URL for attachment access from emails. No auth required.
   * Uses Content-Disposition: inline for PDF/images (view in browser), attachment for others (.doc, .xlsx).
   * Ensures correct filename and extension on save.
   */
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Get('attachments/signed/:token')
  async getAttachmentByToken(
    @Param('token') token: string,
  ): Promise<StreamableFile> {
    const payload = this.tokenService.verify(token);
    if (!payload) {
      throw new BadRequestException(
        'Invalid or expired attachment link. Please request a new email.',
      );
    }

    const { secureUrl, fileName, mimeType } =
      await this.ideasService.getAttachmentForStream(payload.sub);

    const res = await fetch(secureUrl);
    if (!res.ok) {
      this.logger.warn(
        `Cloudinary fetch failed for attachment ${payload.sub}: ${res.status} ${res.statusText}`,
      );
      throw new BadRequestException(
        'Unable to load attachment. File may have been removed from storage.',
      );
    }

    const useInline = payload.disp === 'inline' || isInlineViewable(mimeType);
    const disposition = useInline
      ? `inline; filename="${escapeFilename(fileName)}"`
      : `attachment; filename="${escapeFilename(fileName)}"`;

    const buffer = Buffer.from(await res.arrayBuffer());
    return new StreamableFile(buffer, {
      type: mimeType ?? 'application/octet-stream',
      disposition,
    });
  }
}

function escapeFilename(name: string): string {
  return name.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
