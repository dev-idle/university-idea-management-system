import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

const STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  /** List cycles past interactionClosesAt (exportable). Any status: CLOSED, ACTIVE, or DRAFT. */
  async listExportableCycles(): Promise<
    Array<{
      id: string;
      name: string | null;
      academicYearName: string;
      interactionClosesAt: Date;
      ideaCount: number;
    }>
  > {
    const now = new Date();
    const cycles = await this.prisma.ideaSubmissionCycle.findMany({
      where: {
        interactionClosesAt: { lte: now },
        academicYear: { isActive: true },
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

  /** Validate cycle is exportable (interactionClosesAt passed, has ideas). Throws if not. */
  private async assertCycleExportable(cycleId: string): Promise<void> {
    const now = new Date();
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id: cycleId },
      select: {
        id: true,
        interactionClosesAt: true,
        _count: { select: { ideas: true } },
      },
    });
    if (!cycle) {
      throw new NotFoundException('Proposal cycle not found.');
    }
    if (cycle.interactionClosesAt > now) {
      throw new BadRequestException(
        'Export is only available after the final comment closure date has passed.',
      );
    }
    if (cycle._count.ideas === 0) {
      throw new BadRequestException(
        'This cycle has no ideas. Export requires at least one idea.',
      );
    }
  }

  /** Trigger export job for a specific cycle. Returns jobId for status/download polling. */
  async triggerExport(
    userId: string,
    cycleId: string,
    type: 'full',
  ): Promise<{ jobId: string }> {
    await this.assertCycleExportable(cycleId);
    const job = await this.prisma.exportJob.create({
      data: {
        userId,
        cycleId,
        type,
        status: STATUS.PENDING,
        progress: 0,
      },
    });
    return { jobId: job.id };
  }

  /** Get job status. Verifies user owns the job. */
  async getJobStatus(
    jobId: string,
    userId: string,
  ): Promise<{ status: string; progress?: number; error?: string }> {
    const job = await this.prisma.exportJob.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException('Export job not found or expired.');
    }
    if (job.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }

    if (job.status === STATUS.COMPLETED) {
      return { status: 'completed' };
    }
    if (job.status === STATUS.FAILED) {
      return {
        status: 'failed',
        error: job.error ?? 'Export failed.',
      };
    }
    return {
      status: job.status === STATUS.PROCESSING ? 'processing' : job.status,
      progress: job.progress,
    };
  }

  /** Get export result (Cloudinary URL and filename). Verifies user owns the job. */
  async getExportResult(
    jobId: string,
    userId: string,
  ): Promise<{ cloudinaryUrl: string; fileName: string }> {
    const job = await this.prisma.exportJob.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException('Export job not found or expired.');
    }
    if (job.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    if (job.status !== STATUS.COMPLETED) {
      throw new BadRequestException(
        `Export not ready. Current status: ${job.status}.`,
      );
    }
    if (!job.cloudinaryUrl || !job.fileName) {
      throw new NotFoundException('Export file not found.');
    }
    return {
      cloudinaryUrl: job.cloudinaryUrl,
      fileName: job.fileName,
    };
  }
}
