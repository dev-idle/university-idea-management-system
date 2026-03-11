import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { type Queue } from 'bullmq';
import { EVENTS, NOTIFICATION_QUEUE, QUEUE_JOB_OPTIONS } from './constants';
import type {
  IdeaCreatedPayload,
  IdeaDeletedPayload,
  CommentCreatedPayload,
  CommentRepliedPayload,
} from './schemas/queue-payload.schema';

@Injectable()
export class NotificationQueueService {
  constructor(@InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue) {}

  async addIdeaCreated(payload: IdeaCreatedPayload): Promise<void> {
    await this.queue.add(EVENTS.IDEA_CREATED, payload, QUEUE_JOB_OPTIONS);
  }

  async addIdeaDeleted(payload: IdeaDeletedPayload): Promise<void> {
    await this.queue.add(EVENTS.IDEA_DELETED, payload, QUEUE_JOB_OPTIONS);
  }

  async addCommentCreated(payload: CommentCreatedPayload): Promise<void> {
    await this.queue.add(EVENTS.COMMENT_CREATED, payload, QUEUE_JOB_OPTIONS);
  }

  async addCommentReplied(payload: CommentRepliedPayload): Promise<void> {
    await this.queue.add(EVENTS.COMMENT_REPLIED, payload, QUEUE_JOB_OPTIONS);
  }
}
