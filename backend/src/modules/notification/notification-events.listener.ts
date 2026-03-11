import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from './constants';
import { NotificationQueueService } from './notification-queue.service';
import type {
  IdeaCreatedPayload,
  IdeaDeletedPayload,
  CommentCreatedPayload,
  CommentRepliedPayload,
} from './schemas/queue-payload.schema';

/**
 * Listens to domain events (EventEmitter2) and enqueues notification jobs to BullMQ.
 * Decouples API from mail/DB work; jobs are processed asynchronously by NotificationProcessor.
 */
@Injectable()
export class NotificationEventsListener {
  constructor(private readonly queue: NotificationQueueService) {}

  @OnEvent(EVENTS.IDEA_CREATED)
  async handleIdeaCreated(payload: IdeaCreatedPayload): Promise<void> {
    await this.queue.addIdeaCreated(payload);
  }

  @OnEvent(EVENTS.IDEA_DELETED)
  async handleIdeaDeleted(payload: IdeaDeletedPayload): Promise<void> {
    await this.queue.addIdeaDeleted(payload);
  }

  @OnEvent(EVENTS.COMMENT_CREATED)
  async handleCommentCreated(payload: CommentCreatedPayload): Promise<void> {
    await this.queue.addCommentCreated(payload);
  }

  @OnEvent(EVENTS.COMMENT_REPLIED)
  async handleCommentReplied(payload: CommentRepliedPayload): Promise<void> {
    await this.queue.addCommentReplied(payload);
  }
}
