import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Job } from 'bullmq';
import type { ExportJobData, ExportJobResult } from './export-queue.service';

/**
 * No-op ExportQueueService when REDIS_ENABLED=false.
 * Throws ServiceUnavailableException to avoid Upstash/Redis usage.
 */
@Injectable()
export class ExportNoopQueueService {
  async addExportJob(
    _userId: string,
    _cycleId: string,
    _type: 'csv' | 'documents',
  ): Promise<Job<ExportJobData, ExportJobResult>> {
    throw new ServiceUnavailableException(
      'Export is temporarily disabled. Set REDIS_ENABLED=true to enable.',
    );
  }

  async getJob(
    _jobId: string,
  ): Promise<Job<ExportJobData, ExportJobResult> | null> {
    throw new ServiceUnavailableException(
      'Export is temporarily disabled. Set REDIS_ENABLED=true to enable.',
    );
  }
}
