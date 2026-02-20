import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ExportQueueService } from './export-queue.service';

@Injectable()
export class ExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: ExportQueueService,
  ) {}

  /** List cycles past interactionClosesAt (exportable). Any status: CLOSED, ACTIVE, or DRAFT. */
  async listExportableCycles(): Promise<Array<{
    id: string;
    name: string | null;
    academicYearName: string;
    interactionClosesAt: Date;
    ideaCount: number;
  }>> {
    const now = new Date();
    const cycles = await this.prisma.ideaSubmissionCycle.findMany({
      where: {
        interactionClosesAt: { lte: now },
      },
      select: {
        id: true,
        name: true,
        interactionClosesAt: true,
        academicYear: { select: { name: true } },
        _count: { select: { ideas: true } },
      },
      orderBy: { interactionClosesAt: 'desc' },
    });
    return cycles.map((c) => ({
      id: c.id,
      name: c.name,
      academicYearName: c.academicYear.name,
      interactionClosesAt: c.interactionClosesAt,
      ideaCount: c._count.ideas,
    }));
  }

  /** Validate cycle is exportable (interactionClosesAt passed). Throws if not. */
  private async assertCycleExportable(cycleId: string): Promise<void> {
    const now = new Date();
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id: cycleId },
      select: { id: true, interactionClosesAt: true },
    });
    if (!cycle) {
      throw new NotFoundException('Proposal cycle not found.');
    }
    if (cycle.interactionClosesAt > now) {
      throw new BadRequestException(
        'Export is only available after the final comment closure date has passed.',
      );
    }
  }

  /** Trigger export job for a specific cycle and type (csv | documents). */
  async triggerExport(
    userId: string,
    cycleId: string,
    type: 'csv' | 'documents',
  ): Promise<{ jobId: string }> {
    await this.assertCycleExportable(cycleId);
    const job = await this.queue.addExportJob(userId, cycleId, type);
    return { jobId: job.id! };
  }

  /** Get job status. Verifies user owns the job. */
  async getJobStatus(
    jobId: string,
    userId: string,
  ): Promise<{ status: string; progress?: number; error?: string }> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Export job not found or expired.');
    }
    const data = job.data as { userId: string; cycleId?: string; type?: string };
    if (data.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }

    const state = await job.getState();
    const failedReason = job.failedReason;

    if (state === 'completed') {
      return { status: 'completed' };
    }
    if (state === 'failed') {
      return {
        status: 'failed',
        error: failedReason ?? 'Export failed.',
      };
    }
    const progress = job.progress as number | undefined;
    return {
      status: state === 'active' ? 'processing' : state,
      progress: typeof progress === 'number' ? progress : undefined,
    };
  }

  /** Get export result (Cloudinary URL). Verifies user owns the job. */
  async getExportResult(
    jobId: string,
    userId: string,
  ): Promise<{ cloudinaryUrl: string; fileName: string }> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Export job not found or expired.');
    }
    const data = job.data as { userId: string };
    if (data.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    const state = await job.getState();
    if (state !== 'completed') {
      throw new BadRequestException(
        `Export not ready. Current status: ${state}.`,
      );
    }
    const result = job.returnvalue as { cloudinaryUrl: string; fileName: string } | undefined;
    if (!result?.cloudinaryUrl || !result?.fileName) {
      throw new NotFoundException('Export file not found.');
    }
    return result;
  }
}
