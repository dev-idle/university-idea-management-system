import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { NOTIFICATION_QUEUE } from './constants';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationProcessor } from './notification.processor';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationEventsListener } from './notification-events.listener';

@Module({
  imports: [
    PrismaModule,
    MailModule,
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
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationQueueService,
    NotificationProcessor,
    NotificationEventsListener,
  ],
  exports: [NotificationQueueService],
})
export class NotificationModule {}
