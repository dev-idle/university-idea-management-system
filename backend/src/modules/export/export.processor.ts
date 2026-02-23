import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EXPORT_QUEUE } from './constants';
import type { ExportJobData, ExportJobResult } from './export-queue.service';
import { escapeCsvValue } from './utils/csv-escape.util';
import type { Job } from 'bullmq';
import archiver from 'archiver';

@Processor(EXPORT_QUEUE, { concurrency: 1 })
export class ExportProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {
    super();
  }

  async process(
    job: Job<ExportJobData, ExportJobResult>,
  ): Promise<ExportJobResult> {
    const { cycleId, type } = job.data;
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id: cycleId },
      include: { academicYear: { select: { name: true } } },
    });
    const yearSlug =
      cycle?.academicYear?.name?.replace(/[^a-zA-Z0-9]/g, '-') ?? 'unknown';
    const cycleSlug = (cycle?.name ?? cycleId.slice(0, 8)).replace(
      /[^a-zA-Z0-9]/g,
      '-',
    );
    const dateStr = new Date().toISOString().slice(0, 10);

    const tmpDir = os.tmpdir();
    const baseName = `export-${job.id}-${Date.now()}`;
    const zipPath = path.join(tmpDir, `${baseName}.zip`);

    try {
      await job.updateProgress(5);

      const archive = archiver('zip', { zlib: { level: 6 } });
      const output = fs.createWriteStream(zipPath);
      const archivePromise = new Promise<void>((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
      });
      archive.pipe(output);

      if (type === 'csv') {
        await this.addCsvFiles(archive, cycleId);
      } else {
        await this.addAttachmentsToZip(archive, cycleId, job);
      }

      await archive.finalize();
      await archivePromise;
      await job.updateProgress(85);

      const buffer = fs.readFileSync(zipPath);
      fs.unlinkSync(zipPath);

      const publicId = `export_${cycleId.replace(/-/g, '')}_${type}_${Date.now()}`;
      const { secureUrl } = await this.cloudinary.uploadExportFile(
        buffer,
        publicId,
      );

      const fileName =
        type === 'csv'
          ? `Ideas_Data_${yearSlug}_${cycleSlug}_${dateStr}.zip`
          : `Supporting_Documents_${yearSlug}_${cycleSlug}_${dateStr}.zip`;

      await job.updateProgress(100);
      return { cloudinaryUrl: secureUrl, fileName };
    } catch (err) {
      if (fs.existsSync(zipPath)) {
        try {
          fs.unlinkSync(zipPath);
        } catch {
          /* ignore */
        }
      }
      this.logger.error(
        `Export failed: ${err instanceof Error ? err.message : String(err)}`,
        { jobId: job.id, type },
      );
      throw err;
    }
  }

  private async addCsvFiles(
    archive: archiver.Archiver,
    cycleId: string,
  ): Promise<void> {
    const csvData = await this.buildCycleCsvData(cycleId);
    for (const [fileName, content] of Object.entries(csvData)) {
      archive.append(content, { name: `csv/${fileName}` });
    }
  }

  private async buildCycleCsvData(
    cycleId: string,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    const ideas = await this.prisma.idea.findMany({
      where: { cycleId },
      include: {
        category: { select: { name: true } },
        cycle: { select: { name: true } },
        submittedBy: { select: { email: true, fullName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    const ideaIds = ideas.map((i) => i.id);

    result['ideas.csv'] = this.toCsv(
      [
        'id',
        'title',
        'description',
        'categoryName',
        'cycleName',
        'submitterEmail',
        'submitterFullName',
        'isAnonymous',
        'termsAcceptedAt',
        'createdAt',
        'updatedAt',
      ],
      ideas.map((r) => [
        r.id,
        r.title,
        r.description ?? '',
        r.category?.name ?? '',
        r.cycle?.name ?? '',
        r.submittedBy?.email ?? '',
        r.submittedBy?.fullName ?? '',
        r.isAnonymous ? 'true' : 'false',
        r.termsAcceptedAt?.toISOString() ?? '',
        r.createdAt.toISOString(),
        r.updatedAt.toISOString(),
      ]),
    );

    const comments = ideaIds.length
      ? await this.prisma.ideaComment.findMany({
          where: { ideaId: { in: ideaIds } },
          include: { user: { select: { email: true, fullName: true } } },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    result['idea_comments.csv'] = this.toCsv(
      [
        'id',
        'ideaId',
        'userId',
        'userEmail',
        'userFullName',
        'content',
        'isAnonymous',
        'createdAt',
      ],
      comments.map((r) => [
        r.id,
        r.ideaId,
        r.userId,
        r.user.email,
        r.user.fullName ?? '',
        r.content,
        r.isAnonymous ? 'true' : 'false',
        r.createdAt.toISOString(),
      ]),
    );

    const votes = ideaIds.length
      ? await this.prisma.ideaVote.findMany({
          where: { ideaId: { in: ideaIds } },
          include: { user: { select: { email: true } } },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    result['idea_votes.csv'] = this.toCsv(
      ['id', 'ideaId', 'userId', 'userEmail', 'value', 'createdAt'],
      votes.map((r) => [
        r.id,
        r.ideaId,
        r.userId,
        r.user.email,
        r.value,
        r.createdAt.toISOString(),
      ]),
    );

    const views = ideaIds.length
      ? await this.prisma.ideaView.findMany({
          where: { ideaId: { in: ideaIds } },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    result['idea_views.csv'] = this.toCsv(
      ['id', 'ideaId', 'userId', 'createdAt'],
      views.map((r) => [r.id, r.ideaId, r.userId, r.createdAt.toISOString()]),
    );

    const attachments = ideaIds.length
      ? await this.prisma.ideaAttachment.findMany({
          where: { ideaId: { in: ideaIds } },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    result['idea_attachments.csv'] = this.toCsv(
      [
        'id',
        'ideaId',
        'fileName',
        'secureUrl',
        'mimeType',
        'sizeBytes',
        'createdAt',
      ],
      attachments.map((r) => [
        r.id,
        r.ideaId,
        r.fileName,
        r.secureUrl,
        r.mimeType ?? '',
        r.sizeBytes ?? '',
        r.createdAt.toISOString(),
      ]),
    );

    const userIds = new Set<string>();
    ideas.forEach((i) => i.submittedById && userIds.add(i.submittedById));
    comments.forEach((c) => userIds.add(c.userId));
    votes.forEach((v) => userIds.add(v.userId));
    views.forEach((v) => userIds.add(v.userId));
    const users = userIds.size
      ? await this.prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          include: {
            role: { select: { name: true } },
            department: { select: { name: true } },
          },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    result['users.csv'] = this.toCsv(
      [
        'id',
        'email',
        'fullName',
        'role',
        'departmentName',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
      users.map((r) => [
        r.id,
        r.email,
        r.fullName ?? '',
        r.role.name,
        r.department?.name ?? '',
        r.isActive ? 'true' : 'false',
        r.createdAt.toISOString(),
        r.updatedAt.toISOString(),
      ]),
    );

    const deptIds = [
      ...new Set(users.map((u) => u.departmentId).filter(Boolean)),
    ] as string[];
    const depts = deptIds.length
      ? await this.prisma.department.findMany({
          where: { id: { in: deptIds } },
          orderBy: { createdAt: 'asc' },
        })
      : [];
    result['departments.csv'] = this.toCsv(
      ['id', 'name', 'createdAt', 'updatedAt'],
      depts.map((r) => [
        r.id,
        r.name,
        r.createdAt.toISOString(),
        r.updatedAt.toISOString(),
      ]),
    );

    const cycleCategories = await this.prisma.cycleCategory.findMany({
      where: { cycleId },
      include: { category: true },
      orderBy: { categoryId: 'asc' },
    });
    const cats = cycleCategories.map((cc) => cc.category);
    result['categories.csv'] = this.toCsv(
      ['id', 'name', 'createdAt', 'updatedAt'],
      cats.map((r) => [
        r.id,
        r.name,
        r.createdAt.toISOString(),
        r.updatedAt.toISOString(),
      ]),
    );

    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id: cycleId },
      include: { academicYear: true },
    });
    const years = cycle?.academicYear ? [cycle.academicYear] : [];
    result['academic_years.csv'] = this.toCsv(
      [
        'id',
        'name',
        'startDate',
        'endDate',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
      years.map((r) => [
        r.id,
        r.name,
        r.startDate.toISOString(),
        r.endDate?.toISOString() ?? '',
        r.isActive ? 'true' : 'false',
        r.createdAt.toISOString(),
        r.updatedAt.toISOString(),
      ]),
    );

    const cycles = cycle ? [cycle] : [];
    result['submission_cycles.csv'] = this.toCsv(
      [
        'id',
        'academicYearId',
        'academicYearName',
        'name',
        'ideaSubmissionClosesAt',
        'interactionClosesAt',
        'status',
        'createdAt',
        'updatedAt',
      ],
      cycles.map((r) => [
        r.id,
        r.academicYearId,
        r.academicYear.name,
        r.name ?? '',
        r.ideaSubmissionClosesAt.toISOString(),
        r.interactionClosesAt.toISOString(),
        r.status,
        r.createdAt.toISOString(),
        r.updatedAt.toISOString(),
      ]),
    );

    return result;
  }

  private toCsv(headers: string[], rows: unknown[][]): string {
    const headerLine = headers.map(escapeCsvValue).join(',');
    const dataLines = rows.map((row) => row.map(escapeCsvValue).join(','));
    return [headerLine, ...dataLines].join('\n');
  }

  private async addAttachmentsToZip(
    archive: archiver.Archiver,
    cycleId: string,
    job: Job<ExportJobData>,
  ): Promise<void> {
    const ideaIds = (
      await this.prisma.idea.findMany({
        where: { cycleId },
        select: { id: true },
      })
    ).map((i) => i.id);
    const attachments = ideaIds.length
      ? await this.prisma.ideaAttachment.findMany({
          where: { ideaId: { in: ideaIds } },
          include: { idea: { select: { id: true } } },
          orderBy: { createdAt: 'asc' },
        })
      : [];

    let done = 0;
    const total = attachments.length;
    for (const att of attachments) {
      try {
        const res = await fetch(att.secureUrl);
        if (!res.ok) {
          this.logger.warn(
            `Failed to fetch attachment ${att.id}: ${res.status}`,
          );
          done++;
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        const safeName = att.fileName.replace(/[^\w.-]/g, '_');
        archive.append(buf, {
          name: `attachments/${att.ideaId}/${att.id}_${safeName}`,
        });
      } catch (err) {
        this.logger.warn(
          `Skip attachment ${att.id}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      done++;
      if (total > 0 && done % 10 === 0) {
        await job.updateProgress(10 + Math.floor((done / total) * 70));
      }
    }
  }
}
