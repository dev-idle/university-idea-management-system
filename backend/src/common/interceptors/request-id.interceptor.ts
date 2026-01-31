import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Global interceptor: sets X-Request-Id on request and response for tracing.
 * Production-safe (no PII). Use with Pino for correlation.
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse();
    const id =
      (req.headers[REQUEST_ID_HEADER] as string) ?? randomUUID();
    (req as Request & { id: string }).id = id;
    res.setHeader(REQUEST_ID_HEADER, id);
    return next.handle().pipe(tap());
  }
}
