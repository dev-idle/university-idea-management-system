import { createWriteStream } from 'node:fs';
import * as fsp from 'node:fs/promises';
import { existsSync } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { escapeCsvValue } from './utils/csv-escape.util';
import { EXPORT_EXCLUDED_DEPARTMENT_NAMES } from './export.constants';
import archiver from 'archiver';

/** Progress thresholds (0–100). */
const PROGRESS = {
  START: 5,
  CSV_DONE: 39,
  ATTACHMENTS_START: 40,
  ATTACHMENTS_DONE: 75,
  ZIP_FINALIZED: 85,
  UPLOAD_DONE: 88,
  COMPLETE: 100,
} as const;

export type ExportJobType = 'full';

export interface ExportResult {
  cloudinaryUrl: string;
  fileName: string;
}

export type ProgressCallback = (progress: number) => Promise<void>;

/**
 * QA Manager export: single ZIP with CSVs + documents as .zip files.
 * - csv/: cycle_summary, ideas (with attachment cols merged), idea_comments, category_stats
 * - attachments/ideaId/documents.zip: actual ZIP per idea
 * - ideas.csv: one row per idea; Attachments Path in ZIP points to documents.zip per idea
 */
@Injectable()
export class ExportRunner {
  private readonly logger = new Logger(ExportRunner.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async run(
    jobId: string,
    cycleId: string,
    _type: ExportJobType,
    onProgress: ProgressCallback,
  ): Promise<ExportResult> {
    const cycle = await this.prisma.ideaSubmissionCycle.findUnique({
      where: { id: cycleId },
      include: { academicYear: { select: { name: true } } },
    });
    if (!cycle) {
      throw new Error(`Proposal cycle ${cycleId} not found.`);
    }
    const cycleSlug = (cycle?.name ?? cycleId.slice(0, 8)).replace(
      /[^a-zA-Z0-9]/g,
      '-',
    );
    const dateStr = new Date().toISOString().slice(0, 10);

    const tmpDir = os.tmpdir();
    const baseName = `export-${jobId}-${Date.now()}`;
    const zipPath = path.join(tmpDir, `${baseName}.zip`);

    try {
      await onProgress(PROGRESS.START);

      const archive = archiver('zip', { zlib: { level: 6 } });
      const output = createWriteStream(zipPath);
      const archivePromise = new Promise<void>((resolve, reject) => {
        output.on('close', () => resolve());
        output.on('error', (err) => reject(err));
        archive.on('error', (err) => reject(err));
      });
      archive.pipe(output);

      await this.addCsvFiles(archive, cycle, cycleId, onProgress);
      await this.addAttachmentsToZip(archive, cycleId, onProgress);

      void archive.finalize();
      await archivePromise;
      await onProgress(PROGRESS.ZIP_FINALIZED);

      const buffer = await fsp.readFile(zipPath);
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(1);
      await fsp.unlink(zipPath);
      await onProgress(PROGRESS.UPLOAD_DONE);

      this.logger.debug(
        `Export zip ready (${sizeMB} MB), uploading to Cloudinary…`,
      );
      const publicId = `export_${cycleId.replace(/-/g, '')}_full_${Date.now()}`;
      const { secureUrl } = await this.cloudinary.uploadExportFile(
        buffer,
        publicId,
      );

      const fileName = `${cycleSlug}_${dateStr}.zip`;

      await onProgress(100);
      return { cloudinaryUrl: secureUrl, fileName };
    } catch (err) {
      if (existsSync(zipPath)) {
        try {
          await fsp.unlink(zipPath);
        } catch {
          /* ignore */
        }
      }
      this.logger.error(
        `Export failed: ${err instanceof Error ? err.message : String(err)}`,
        { jobId },
      );
      throw err;
    }
  }

  /** CSV file order: context first (cycle_summary), then main data, then reference data. */
  private static readonly CSV_ORDER = [
    'cycle_summary.csv',
    'ideas.csv',
    'idea_comments.csv',
    'category_stats.csv',
    'department_qa_coordinators.csv',
  ] as const;

  private async addCsvFiles(
    archive: archiver.Archiver,
    cycle: {
      id: string;
      name: string | null;
      ideaSubmissionClosesAt: Date;
      interactionClosesAt: Date;
      status: string;
      academicYear: { name: string };
    },
    cycleId: string,
    onProgress: ProgressCallback,
  ): Promise<void> {
    const csvData = await this.buildCycleCsvData(cycle, cycleId);
    const order = ExportRunner.CSV_ORDER;
    for (let i = 0; i < order.length; i++) {
      const fileName = order[i];
      if (!fileName) continue;
      const content = csvData[fileName];
      if (content != null) {
        archive.append(content, { name: `csv/${fileName}` });
      }
      const pct =
        10 + Math.floor(((i + 1) / order.length) * (PROGRESS.CSV_DONE - 10));
      await onProgress(Math.min(pct, PROGRESS.CSV_DONE));
    }
  }

  private async addAttachmentsToZip(
    archive: archiver.Archiver,
    cycleId: string,
    onProgress: ProgressCallback,
  ): Promise<void> {
    const ideasWithAttachments = await this.prisma.idea.findMany({
      where: { cycleId },
      select: {
        id: true,
        attachments: { orderBy: { createdAt: 'asc' } },
      },
    });
    const byIdea = new Map<
      string,
      Array<{ id: string; ideaId: string; fileName: string; secureUrl: string }>
    >();
    for (const idea of ideasWithAttachments) {
      if (idea.attachments.length > 0) {
        byIdea.set(idea.id, idea.attachments);
      }
    }

    const ideaIdsWithAttachments = Array.from(byIdea.keys());
    const total = ideaIdsWithAttachments.length;
    if (total === 0) {
      await onProgress(PROGRESS.ATTACHMENTS_DONE);
      return;
    }

    let done = 0;
    const range = PROGRESS.ATTACHMENTS_DONE - PROGRESS.ATTACHMENTS_START;
    for (const ideaId of ideaIdsWithAttachments) {
      const ideaAttachments = byIdea.get(ideaId)!;
      const zipBuf = await this.buildIdeaDocumentsZip(ideaAttachments);
      archive.append(zipBuf, { name: `attachments/${ideaId}/documents.zip` });
      done++;
      if (done % 5 === 0 || done === total) {
        await onProgress(
          PROGRESS.ATTACHMENTS_START + Math.floor((done / total) * range),
        );
      }
    }
  }

  private async buildCycleCsvData(
    cycle: {
      id: string;
      name: string | null;
      ideaSubmissionClosesAt: Date;
      interactionClosesAt: Date;
      status: string;
      academicYear: { name: string };
    },
    cycleId: string,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    const ideas = await this.prisma.idea.findMany({
      where: { cycleId },
      include: {
        category: { select: { name: true } },
        cycle: { select: { name: true } },
        submittedBy: {
          select: {
            email: true,
            fullName: true,
            departmentId: true,
            department: { select: { name: true } },
          },
        },
        votes: { select: { value: true } },
        _count: {
          select: { views: true, comments: true, attachments: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (ideas.length === 0) {
      throw new Error(
        'This cycle has no ideas. Export requires at least one idea in the cycle.',
      );
    }

    const ideaIds = ideas.map((i) => i.id);
    const ideasRows: unknown[][] = [];
    for (const r of ideas) {
      const votesUp = r.votes.filter((v) => v.value === 'up').length;
      const votesDown = r.votes.filter((v) => v.value === 'down').length;
      const pathInZip =
        r._count.attachments > 0 ? `attachments/${r.id}/documents.zip` : '';
      const baseRow = [
        r.id,
        r.title,
        r.description ?? '',
        r.category?.name ?? '',
        r.cycle?.name ?? '',
        r.submittedBy?.email ?? '',
        r.submittedBy?.fullName ?? '',
        r.submittedBy?.department?.name ?? '',
        r.isAnonymous ? 'true' : 'false',
        String(r._count.views),
        String(r._count.comments),
        String(votesUp),
        String(votesDown),
        String(r._count.attachments),
        pathInZip,
        this.formatDateForCsv(r.termsAcceptedAt),
        this.formatDateForCsv(r.createdAt),
        this.formatDateForCsv(r.updatedAt),
      ];
      ideasRows.push(baseRow);
    }

    result['ideas.csv'] = this.toCsv(
      [
        'Idea ID',
        'Title',
        'Description',
        'Category',
        'Submission Cycle',
        'Submitter Email',
        'Submitter Name',
        'Department',
        'Anonymous',
        'View Count',
        'Comment Count',
        'Votes Up',
        'Votes Down',
        'Attachment Count',
        'Attachments Path in ZIP',
        'Terms Accepted At',
        'Idea Created At',
        'Idea Updated At',
      ],
      ideasRows,
    );

    const comments =
      ideaIds.length > 0
        ? await this.prisma.ideaComment.findMany({
            where: { ideaId: { in: ideaIds } },
            include: {
              user: { select: { email: true, fullName: true } },
              idea: { select: { title: true } },
              reactions: { select: { value: true } },
            },
            orderBy: { createdAt: 'asc' },
          })
        : [];
    result['idea_comments.csv'] = this.toCsv(
      [
        'Comment ID',
        'Idea ID',
        'Idea Title',
        'Commenter Email',
        'Commenter Name',
        'Content',
        'Anonymous',
        'Likes',
        'Dislikes',
        'Comment Created At',
        'Comment Updated At',
      ],
      comments.map((r) => {
        const likeCount = r.reactions.filter((l) => l.value === 'up').length;
        const dislikeCount = r.reactions.filter(
          (l) => l.value === 'down',
        ).length;
        return [
          r.id,
          r.ideaId,
          r.idea?.title ?? '',
          r.user.email,
          r.user.fullName ?? '',
          r.content,
          r.isAnonymous ? 'true' : 'false',
          String(likeCount),
          String(dislikeCount),
          this.formatDateForCsv(r.createdAt),
          this.formatDateForCsv(r.updatedAt),
        ];
      }),
    );

    const excludedSet = new Set<string>(EXPORT_EXCLUDED_DEPARTMENT_NAMES);
    const allDepartments = await this.prisma.department.findMany({
      where: { name: { notIn: Array.from(excludedSet) } },
      select: { id: true },
    });
    const participatingDeptIds = new Set<string>();
    for (const idea of ideas) {
      const deptId = idea.submittedBy?.departmentId;
      const deptName = idea.submittedBy?.department?.name;
      if (deptId && deptName && !excludedSet.has(deptName)) {
        const isInScope = allDepartments.some((d) => d.id === deptId);
        if (isInScope) participatingDeptIds.add(deptId);
      }
    }
    const participatingCount = participatingDeptIds.size;
    const nonParticipatingCount = allDepartments.length - participatingCount;

    const [totalViews, totalComments, totalVotesUp, totalVotesDown] =
      await Promise.all([
        this.prisma.ideaView.count({ where: { ideaId: { in: ideaIds } } }),
        this.prisma.ideaComment.count({ where: { ideaId: { in: ideaIds } } }),
        this.prisma.ideaVote.count({
          where: { ideaId: { in: ideaIds }, value: 'up' },
        }),
        this.prisma.ideaVote.count({
          where: { ideaId: { in: ideaIds }, value: 'down' },
        }),
      ]);

    const cycleCategories = await this.prisma.cycleCategory.findMany({
      where: { cycleId },
      include: { category: true },
      orderBy: { categoryId: 'asc' },
    });
    const categoryCount = cycleCategories.length;
    const categoriesWithIdeas = new Set(
      ideas.map((i) => i.categoryId).filter(Boolean),
    );
    const categoriesWithIdeasCount = categoriesWithIdeas.size;

    result['cycle_summary.csv'] = this.toCsv(
      [
        'Cycle ID',
        'Cycle Name',
        'Academic Year',
        'Submission Deadline',
        'Commenting Deadline',
        'Status',
        'Total Ideas',
        'Total Comments',
        'Total Views',
        'Total Votes Up',
        'Total Votes Down',
        'Departments with Ideas',
        'Departments without Ideas',
        'Categories in Cycle',
        'Categories with Ideas',
      ],
      [
        [
          cycle.id,
          cycle.name ?? '',
          cycle.academicYear.name,
          this.formatDateForCsv(cycle.ideaSubmissionClosesAt),
          this.formatDateForCsv(cycle.interactionClosesAt),
          cycle.status,
          String(ideas.length),
          String(totalComments),
          String(totalViews),
          String(totalVotesUp),
          String(totalVotesDown),
          String(participatingCount),
          String(nonParticipatingCount),
          String(categoryCount),
          String(categoriesWithIdeasCount),
        ],
      ],
    );

    const categoryStats = await Promise.all(
      cycleCategories.map(async (cc) => {
        const cat = cc.category;
        const catIdeas = ideas.filter((i) => i.categoryId === cat.id);
        const catIdeaIds = catIdeas.map((i) => i.id);
        const [commentCount, votesUp, votesDown] =
          catIdeaIds.length > 0
            ? await Promise.all([
                this.prisma.ideaComment.count({
                  where: { ideaId: { in: catIdeaIds } },
                }),
                this.prisma.ideaVote.count({
                  where: { ideaId: { in: catIdeaIds }, value: 'up' },
                }),
                this.prisma.ideaVote.count({
                  where: { ideaId: { in: catIdeaIds }, value: 'down' },
                }),
              ])
            : [0, 0, 0];
        return [
          cat.id,
          cat.name,
          String(catIdeas.length),
          String(commentCount),
          String(votesUp),
          String(votesDown),
          catIdeas.length > 0 ? 'true' : 'false',
        ];
      }),
    );

    result['category_stats.csv'] = this.toCsv(
      [
        'Category ID',
        'Category Name',
        'Idea Count',
        'Comment Count',
        'Votes Up',
        'Votes Down',
        'Has Ideas',
      ],
      categoryStats,
    );

    const departments = await this.prisma.department.findMany({
      where: { name: { notIn: Array.from(excludedSet) } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    const qaCoordinators = await this.prisma.user.findMany({
      where: {
        isActive: true,
        departmentId: { in: departments.map((d) => d.id) },
        role: { name: 'QA_COORDINATOR' },
      },
      select: {
        departmentId: true,
        email: true,
        fullName: true,
      },
    });
    const qcByDept = new Map<string | null, (typeof qaCoordinators)[0]>();
    for (const qc of qaCoordinators) {
      if (qc.departmentId) qcByDept.set(qc.departmentId, qc);
    }

    const deptQcRows = departments.map((d) => {
      const qc = qcByDept.get(d.id);
      return [d.id, d.name, qc?.email ?? '', qc?.fullName ?? ''];
    });

    result['department_qa_coordinators.csv'] = this.toCsv(
      [
        'Department ID',
        'Department Name',
        'QA Coordinator Email',
        'QA Coordinator Name',
      ],
      deptQcRows,
    );

    return result;
  }

  /** Format date for CSV (Excel-friendly: YYYY-MM-DD HH:mm:ss, no T/Z). */
  private formatDateForCsv(d: Date | null | undefined): string {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
  }

  /** CSV with UTF-8 BOM and CRLF for Excel compatibility. */
  private toCsv(headers: string[], rows: unknown[][]): string {
    const headerLine = headers.map(escapeCsvValue).join(',');
    const dataLines = rows.map((row) => row.map(escapeCsvValue).join(','));
    return '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  }

  /** Build documents.zip for one idea using temp file (avoids stream timing issues). */
  private async buildIdeaDocumentsZip(
    ideaAttachments: Array<{
      id: string;
      ideaId: string;
      fileName: string;
      secureUrl: string;
    }>,
  ): Promise<Buffer> {
    const tmpDir = os.tmpdir();
    const first = ideaAttachments[0];
    const tmpPath = path.join(
      tmpDir,
      `idea-docs-${first?.ideaId ?? 'unknown'}-${Date.now()}.zip`,
    );

    try {
      const out = createWriteStream(tmpPath);
      const subArchive = archiver('zip', { zlib: { level: 6 } });
      const done = new Promise<void>((resolve, reject) => {
        out.on('close', () => resolve());
        out.on('error', reject);
        subArchive.on('error', reject);
      });
      subArchive.pipe(out);

      for (const att of ideaAttachments) {
        try {
          const res = await fetch(att.secureUrl);
          if (!res.ok) {
            this.logger.warn(
              `Failed to fetch attachment ${att.id}: ${res.status}`,
            );
            continue;
          }
          const buf = Buffer.from(await res.arrayBuffer());
          const safeName =
            att.fileName.replace(/[^\w.-]/g, '_') ||
            `file_${att.id.slice(0, 8)}`;
          subArchive.append(buf, { name: safeName });
        } catch (err) {
          this.logger.warn(
            `Skip attachment ${att.id}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      await subArchive.finalize();
      await done;

      const buffer = await fsp.readFile(tmpPath);
      return buffer;
    } finally {
      if (existsSync(tmpPath)) {
        try {
          await fsp.unlink(tmpPath);
        } catch {
          /* ignore */
        }
      }
    }
  }
}
