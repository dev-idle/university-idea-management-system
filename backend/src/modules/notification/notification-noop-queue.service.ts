import { Injectable } from '@nestjs/common';
import type {
  IdeaCreatedPayload,
  IdeaDeletedPayload,
  CommentCreatedPayload,
  CommentRepliedPayload,
} from './schemas/queue-payload.schema';

/**
 * No-op NotificationQueueService when REDIS_ENABLED=false.
 * Swallows all enqueue calls to avoid Upstash/Redis commands.
 */
@Injectable()
export class NotificationNoopQueueService {
  addIdeaCreated(payload: IdeaCreatedPayload): Promise<void> {
    void payload;
    return Promise.resolve();
  }

  addIdeaDeleted(payload: IdeaDeletedPayload): Promise<void> {
    void payload;
    return Promise.resolve();
  }

  addCommentCreated(payload: CommentCreatedPayload): Promise<void> {
    void payload;
    return Promise.resolve();
  }

  addCommentReplied(payload: CommentRepliedPayload): Promise<void> {
    void payload;
    return Promise.resolve();
  }
}
