import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ExportRunner } from './export.runner';
import { ExportWorkerService } from './export-worker.service';

/**
 * Export module. Uses DB-based job queue (ExportJob table) instead of Redis/BullMQ.
 * ExportWorkerService polls for pending jobs and processes them in-process.
 */
@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ExportController],
  providers: [ExportService, ExportRunner, ExportWorkerService],
})
export class ExportModule {}
