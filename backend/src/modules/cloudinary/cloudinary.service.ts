import { Readable } from 'node:stream';
import {
  Injectable,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

/** Folder for idea supporting documents (2026 standard). */
export const CLOUDINARY_IDEA_FOLDER = 'idea-attachments';

/** Max public_ids per delete_resources call (Cloudinary limit). */
const DELETE_BATCH_SIZE = 100;

/** Max file size for proxy upload (10 MB). */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface UploadFileResult {
  cloudinaryPublicId: string;
  secureUrl: string;
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface ListResourcesResult {
  resources: Array<{
    public_id: string;
    secure_url: string;
    resource_type: string;
    bytes?: number;
    created_at?: string;
    folder?: string;
  }>;
  next_cursor?: string;
}

@Injectable()
export class CloudinaryService {
  private configured = false;

  constructor(private readonly config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.configured = true;
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Returns true if the URL is a Cloudinary secure URL for our configured cloud.
   * Used to allow preview of uploaded-but-unsaved attachments (same cloud only).
   */
  isOurSecureUrl(secureUrl: string): boolean {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    if (!cloudName) return false;
    try {
      const u = new URL(secureUrl);
      return (
        u.protocol === 'https:' &&
        u.hostname === 'res.cloudinary.com' &&
        u.pathname.startsWith(`/${cloudName}/`)
      );
    } catch {
      return false;
    }
  }

  private ensureConfigured(): void {
    if (!this.configured) {
      throw new ServiceUnavailableException(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }
  }

  /**
   * Upload a file (buffer) to Cloudinary via server. Avoids CORS by not uploading from browser.
   * Returns attachment ref for idea creation. Used by POST /api/ideas/upload.
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType?: string,
  ): Promise<UploadFileResult> {
    this.ensureConfigured();
    if (buffer.length > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `File size exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
      );
    }
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_IDEA_FOLDER,
          resource_type: 'raw',
        },
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result?.public_id || !result?.secure_url) {
            reject(new Error('Invalid Cloudinary upload response'));
            return;
          }
          resolve({
            cloudinaryPublicId: result.public_id,
            secureUrl: result.secure_url,
            fileName,
            mimeType: mimeType ?? undefined,
            sizeBytes: result.bytes ?? buffer.length,
          });
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  /**
   * List resources in Cloudinary (Admin API).
   * Default: raw type, idea-attachments folder. Used for search/audit (2026 standard).
   */
  async listResources(options?: {
    prefix?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    maxResults?: number;
    nextCursor?: string;
  }): Promise<ListResourcesResult> {
    this.ensureConfigured();
    const prefix = options?.prefix ?? CLOUDINARY_IDEA_FOLDER;
    const maxResults = Math.min(
      Math.max(1, options?.maxResults ?? 100),
      500,
    );
    const resourceType = options?.resourceType ?? 'raw';

    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: resourceType,
      prefix,
      max_results: maxResults,
      next_cursor: options?.nextCursor,
    });

    return {
      resources: (result.resources ?? []).map((r: Record<string, unknown>) => ({
        public_id: r.public_id as string,
        secure_url: r.secure_url as string,
        resource_type: (r.resource_type as string) ?? resourceType,
        bytes: r.bytes as number | undefined,
        created_at: r.created_at as string | undefined,
        folder: r.folder as string | undefined,
      })),
      next_cursor: result.next_cursor as string | undefined,
    };
  }

  /**
   * Delete resources by public_id (Admin API).
   * Used when an idea is deleted or for cleanup (2026 standard). Max 100 per call.
   */
  async deleteResources(
    publicIds: string[],
    resourceType: 'image' | 'video' | 'raw' = 'raw',
  ): Promise<{ deleted: Record<string, string> }> {
    this.ensureConfigured();
    if (!publicIds.length) {
      return { deleted: {} };
    }
    if (publicIds.length > DELETE_BATCH_SIZE) {
      throw new BadRequestException(
        `Maximum ${DELETE_BATCH_SIZE} public_ids per request.`,
      );
    }

    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });

    return {
      deleted: (result.deleted as Record<string, string>) ?? {},
    };
  }
}
