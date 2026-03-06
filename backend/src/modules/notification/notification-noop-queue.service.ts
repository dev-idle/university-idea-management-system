import { Injectable } from '@nestjs/common';
import type {
  IdeaCreatedPayload,
  CommentCreatedPayload,
  CommentRepliedPayload,
} from './schemas/queue-payload.schema';

/**
 * No-op NotificationQueueService when REDIS_ENABLED=false.
 * Swallows all enqueue calls to avoid Upstash/Redis commands.
 */
@Injectable()
export class NotificationNoopQueueService {
  async addIdeaCreated(_payload: IdeaCreatedPayload): Promise<void> {
    // No-op: Redis disabled
  }

  async addCommentCreated(_payload: CommentCreatedPayload): Promise<void> {
    // No-op: Redis disabled
  }

  async addCommentReplied(_payload: CommentRepliedPayload): Promise<void> {
    // No-op: Redis disabled
  }
}
