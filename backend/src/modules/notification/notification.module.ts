import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { NOTIFICATION_QUEUE } from './constants';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationProcessor } from './notification.processor';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationNoopQueueService } from './notification-noop-queue.service';
import { NotificationEventsListener } from './notification-events.listener';

/** Redis enabled only when REDIS_ENABLED=true|1. Default: off. */
const REDIS_ENABLED =
  process.env.REDIS_ENABLED === 'true' || process.env.REDIS_ENABLED === '1';

@Module({})
export class NotificationModule {
  static forRoot(): DynamicModule {
    const redisImports = REDIS_ENABLED
      ? [
          BullModule.forRootAsync({
            useFactory: (config: ConfigService) => {
              const redisUrl =
                config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
              const useTls = redisUrl.startsWith('rediss://');
              const url = new URL(
                redisUrl.replace(/^rediss?:\/\//, 'https://'),
              );
              return {
                connection: {
                  host: url.hostname || 'localhost',
                  port: parseInt(url.port || '6379', 10),
                  password: url.password || undefined,
                  username: url.username || undefined,
                  maxRetriesPerRequest: null,
                  ...(useTls && { tls: {} }),
                },
              };
            },
            inject: [ConfigService],
          }),
          BullModule.registerQueue({
            name: NOTIFICATION_QUEUE,
          }),
        ]
      : [];

    const queueProvider = REDIS_ENABLED
      ? NotificationQueueService
      : {
          provide: NotificationQueueService,
          useClass: NotificationNoopQueueService,
        };

    const processorProvider = REDIS_ENABLED ? [NotificationProcessor] : [];

    return {
      module: NotificationModule,
      imports: [PrismaModule, MailModule, ...redisImports],
      controllers: [NotificationController],
      providers: [
        NotificationService,
        queueProvider,
        ...processorProvider,
        NotificationEventsListener,
      ],
      exports: [NotificationQueueService],
    };
  }
}
