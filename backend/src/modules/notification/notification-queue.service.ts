import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { type Queue } from 'bullmq';
import {
  EVENTS,
  NOTIFICATION_QUEUE,
  QUEUE_JOB_OPTIONS,
} from './constants';
import type {
  IdeaCreatedPayload,
  CommentCreatedPayload,
} from './schemas/queue-payload.schema';

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue,
  ) {}

  async addIdeaCreated(payload: IdeaCreatedPayload): Promise<void> {
    await this.queue.add(EVENTS.IDEA_CREATED, payload, QUEUE_JOB_OPTIONS);
  }

  async addCommentCreated(payload: CommentCreatedPayload): Promise<void> {
    await this.queue.add(EVENTS.COMMENT_CREATED, payload, QUEUE_JOB_OPTIONS);
  }
}
