import {
  ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common/interfaces';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

function getMessage(exception: HttpException): string | string[] {
  const res = exception.getResponse();
  if (typeof res === 'string') return res;
  const msg = (res as { message?: string | string[] }).message;
  return msg ?? exception.message;
}

/**
 * Global HTTP exception filter. In production, hides stack traces and
 * avoids logging sensitive 5xx details; uses request ID when available.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly config: ConfigService) {}

  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? getMessage(exception)
        : 'Internal server error';

    const body: Record<string, unknown> = {
      statusCode: status,
      error:
        exception instanceof HttpException
          ? ((exception.getResponse() as { error?: string })?.error ?? 'Error')
          : 'Internal Server Error',
      message: Array.isArray(message) ? message : [message],
    };

    if (!isProduction && exception instanceof Error && exception.stack) {
      body.stack = exception.stack;
    }

    const requestId = (req as Request & { id?: string }).id;
    const logContext = requestId ? `[${requestId}] ` : '';
    if (isProduction && status >= 500) {
      this.logger.error(`${logContext}${status} Internal server error`);
    } else {
      this.logger.warn(
        `${logContext}${status} ${typeof message === 'string' ? message : message[0]}`,
      );
    }

    res.status(status).json(body);
  }
}
