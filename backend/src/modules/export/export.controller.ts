import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/auth.types';
import { ExportService } from './export.service';
import { z } from 'zod';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  triggerExportBodySchema,
  type TriggerExportBody,
} from './dto/trigger-export.dto';

const jobIdParamSchema = z.object({
  id: z.string().min(1, 'Job ID is required'),
});

@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('QA_MANAGER')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * List proposal cycles that are closed and past interactionClosesAt (exportable).
   */
  @Get('cycles')
  async listExportableCycles() {
    return this.exportService.listExportableCycles();
  }

  /**
   * Trigger export job for a specific cycle. Returns jobId for status/download polling.
   * Cycle must be CLOSED and interactionClosesAt must have passed.
   */
  @Post('trigger')
  async trigger(
    @Body(new ZodValidationPipe(triggerExportBodySchema))
    body: TriggerExportBody,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const sub = user.sub;
    if (!sub) {
      throw new Error('User ID missing');
    }
    return this.exportService.triggerExport(sub, body.cycleId, body.type);
  }

  /**
   * Get export job status. Returns status, progress, or error.
   */
  @Get(':id/status')
  async getStatus(
    @Param(new ZodValidationPipe(jobIdParamSchema)) params: { id: string },
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const sub = user.sub;
    if (!sub) {
      throw new Error('User ID missing');
    }
    return this.exportService.getJobStatus(params.id, sub);
  }

  /**
   * Download export file. Streams from Cloudinary to client (avoids buffering large files in memory).
   */
  @Get(':id/download')
  async download(
    @Param(new ZodValidationPipe(jobIdParamSchema)) params: { id: string },
    @CurrentUser() user: AccessTokenPayload,
    @Res() res: Response,
  ): Promise<void> {
    const sub = user.sub;
    if (!sub) {
      throw new Error('User ID missing');
    }
    const { cloudinaryUrl, fileName } =
      await this.exportService.getExportResult(params.id, sub);
    const fetchRes = await fetch(cloudinaryUrl);
    if (!fetchRes.ok) {
      throw new ServiceUnavailableException(
        'Export file temporarily unavailable. Please try again shortly.',
      );
    }
    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const disposition = `attachment; filename="${esc(fileName)}"`;
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': disposition,
      'Cache-Control': 'no-store',
    });

    const { Readable } = await import('node:stream');
    if (fetchRes.body) {
      const nodeStream = Readable.fromWeb(
        fetchRes.body as import('node:stream/web').ReadableStream<Uint8Array>,
      );
      nodeStream.pipe(res);
    } else {
      const buffer = Buffer.from(await fetchRes.arrayBuffer());
      res.send(buffer);
    }
  }
}
