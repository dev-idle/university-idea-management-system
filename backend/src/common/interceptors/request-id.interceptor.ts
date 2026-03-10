import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Global interceptor: sets X-Request-Id on request and response for tracing.
 * Production-safe (no PII). Use with Pino for correlation.
 */
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request & { id?: string }>();
    const res = ctx.getResponse<Response>();
    const raw = req.headers[REQUEST_ID_HEADER];
    const id =
      (typeof raw === 'string' && raw.trim()
        ? raw.trim()
        : Array.isArray(raw) && raw[0]?.trim()
          ? raw[0].trim()
          : null) ?? randomUUID();
    req.id = id;
    res.setHeader(REQUEST_ID_HEADER, id);
    return next.handle().pipe(tap());
  }
}
