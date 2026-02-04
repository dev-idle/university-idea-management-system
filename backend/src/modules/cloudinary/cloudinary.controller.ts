import {
  Controller,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CloudinaryService } from './cloudinary.service';
import {
  listResourcesQuerySchema,
  type ListResourcesQuery,
} from './dto/list-resources.dto';
import {
  deleteResourcesBodySchema,
  type DeleteResourcesBody,
} from './dto/delete-resources.dto';

/**
 * Admin-only Cloudinary search and update (2026 standard).
 * Search: list resources in idea-attachments folder.
 * Update: delete resources by public_id (e.g. when idea is deleted).
 */
@Controller('cloudinary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class CloudinaryController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  /**
   * List resources (search/audit). Default: raw type, idea-attachments prefix.
   */
  @Get('resources')
  listResources(
    @Query(new ZodValidationPipe(listResourcesQuerySchema))
    query: ListResourcesQuery,
  ) {
    if (!this.cloudinary.isConfigured()) {
      throw new ServiceUnavailableException(
        'Cloudinary is not configured. Set CLOUDINARY_* env vars.',
      );
    }
    return this.cloudinary.listResources({
      prefix: query.prefix,
      resourceType: query.resource_type,
      maxResults: query.max_results,
      nextCursor: query.next_cursor,
    });
  }

  /**
   * Delete resources by public_id (e.g. cleanup or when idea is deleted).
   * Max 100 public_ids per request.
   */
  @Delete('resources')
  @HttpCode(HttpStatus.OK)
  deleteResources(
    @Body(new ZodValidationPipe(deleteResourcesBodySchema))
    body: DeleteResourcesBody,
  ) {
    if (!this.cloudinary.isConfigured()) {
      throw new ServiceUnavailableException(
        'Cloudinary is not configured. Set CLOUDINARY_* env vars.',
      );
    }
    return this.cloudinary.deleteResources(
      body.publicIds,
      body.resource_type,
    );
  }
}
