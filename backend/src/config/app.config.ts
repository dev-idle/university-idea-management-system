import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';

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
 * cookie-parser, strict CORS (from CORS_ORIGINS when set), and optional shutdown hooks.
 * Validation: Zod only (use ZodValidationPipe per-parameter in controllers).
 */
export function configureApp(
  app: INestApplication,
  options: ConfigureAppOptions = {},
): void {
  const { enableShutdownHooks = true } = options;
  const config = app.get(ConfigService);

  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  const corsOrigins = config.get<string>('CORS_ORIGINS');
  const origin = corsOrigins
    ? corsOrigins
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : true;
  app.enableCors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
  });

  if (enableShutdownHooks) {
    app.enableShutdownHooks();
  }
}
