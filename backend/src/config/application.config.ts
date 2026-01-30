import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

/** Global API route prefix (NestJS 11+: string only, no RegExp). */
export const API_PREFIX = 'api';

/** Default HTTP port when PORT env is not set. */
export const DEFAULT_PORT = 3001;

export interface ConfigureAppOptions {
  /** Enable shutdown hooks (SIGTERM/SIGINT). Default true; set false in tests. */
  enableShutdownHooks?: boolean;
}

/**
 * Applies NestJS 11+ application-level config: global prefix, Helmet,
 * cookie-parser, CORS, and optional shutdown hooks.
 * Validation: Zod only (use ZodValidationPipe per-parameter in controllers).
 */
export function configureApp(
  app: INestApplication,
  options: ConfigureAppOptions = {},
): void {
  const { enableShutdownHooks = true } = options;

  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors();

  if (enableShutdownHooks) {
    app.enableShutdownHooks();
  }
}
