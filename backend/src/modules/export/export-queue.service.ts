import * as crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue, Job } from 'bullmq';
import { EXPORT_QUEUE, EXPORT_JOB_OPTIONS } from './constants';

export interface ExportJobData {
  userId: string;
  cycleId: string;
  type: 'csv' | 'documents';
}

export interface ExportJobResult {
  cloudinaryUrl: string;
  fileName: string;
}

@Injectable()
export class ExportQueueService {
  constructor(@InjectQueue(EXPORT_QUEUE) private readonly queue: Queue) {}

  async addExportJob(
    userId: string,
    cycleId: string,
    type: 'csv' | 'documents',
  ): Promise<Job<ExportJobData, ExportJobResult>> {
    const jobId = `export-${crypto.randomUUID()}`;
    const job = await this.queue.add(
      type === 'csv' ? 'cycle-csv' : 'cycle-docs',
      { userId, cycleId, type },
      {
        ...EXPORT_JOB_OPTIONS,
        jobId,
      },
    );
    return job as Job<ExportJobData, ExportJobResult>;
  }

  async getJob(
    jobId: string,
  ): Promise<Job<ExportJobData, ExportJobResult> | null> {
    const job = await this.queue.getJob(jobId);
    return job ?? null;
  }
}
