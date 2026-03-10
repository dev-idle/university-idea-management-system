import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ExportRunner } from './export.runner';

const POLL_INTERVAL_MS = 3000;
const STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

/**
 * In-process worker that polls ExportJob table for pending jobs and processes them.
 * No Redis required. Runs on an interval when the app is up.
 */
@Injectable()
export class ExportWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExportWorkerService.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly exportRunner: ExportRunner,
  ) {}

  onModuleInit(): void {
    this.intervalId = setInterval(() => {
      void this.tick();
    }, POLL_INTERVAL_MS);
    this.logger.log('Export worker started (DB-based, poll interval: 3s)');
  }

  onModuleDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.logger.log('Export worker stopped');
  }

  private async tick(): Promise<void> {
    if (this.isProcessing) return;

    const job = await this.prisma.exportJob.findFirst({
      where: { status: STATUS.PENDING },
      orderBy: { createdAt: 'asc' },
    });

    if (!job) return;

    this.isProcessing = true;
    try {
      await this.prisma.exportJob.update({
        where: { id: job.id },
        data: {
          status: STATUS.PROCESSING,
          startedAt: new Date(),
        },
      });

      const onProgress = async (progress: number) => {
        await this.prisma.exportJob.update({
          where: { id: job.id },
          data: { progress },
        });
      };

      const result = await this.exportRunner.run(
        job.id,
        job.cycleId,
        job.type as 'full',
        onProgress,
      );

      await this.prisma.exportJob.update({
        where: { id: job.id },
        data: {
          status: STATUS.COMPLETED,
          progress: 100,
          cloudinaryUrl: result.cloudinaryUrl,
          fileName: result.fileName,
          completedAt: new Date(),
        },
      });

      this.logger.debug(`Export job ${job.id} completed`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Export job ${job.id} failed: ${errorMsg}`);

      await this.prisma.exportJob.update({
        where: { id: job.id },
        data: {
          status: STATUS.FAILED,
          error: errorMsg,
          completedAt: new Date(),
        },
      });
    } finally {
      this.isProcessing = false;
    }
  }
}
