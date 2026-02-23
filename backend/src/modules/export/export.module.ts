import { DynamicModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { EXPORT_QUEUE } from './constants';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ExportQueueService } from './export-queue.service';
import { ExportNoopQueueService } from './export-noop-queue.service';
import { ExportProcessor } from './export.processor';

/** Redis enabled only when REDIS_ENABLED=true|1. Default: off. */
const REDIS_ENABLED =
  process.env.REDIS_ENABLED === 'true' || process.env.REDIS_ENABLED === '1';

@Module({})
export class ExportModule {
  static forRoot(): DynamicModule {
    const redisImports = REDIS_ENABLED
      ? [
          BullModule.registerQueue({
            name: EXPORT_QUEUE,
          }),
        ]
      : [];

    const queueProvider = REDIS_ENABLED
      ? ExportQueueService
      : {
          provide: ExportQueueService,
          useClass: ExportNoopQueueService,
        };

    const processorProvider = REDIS_ENABLED ? [ExportProcessor] : [];

    return {
      module: ExportModule,
      imports: [PrismaModule, CloudinaryModule, ...redisImports],
      controllers: [ExportController],
      providers: [ExportService, queueProvider, ...processorProvider],
    };
  }
}
