import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';

/** Global API route prefix (NestJS 11+: string only, no RegExp). */
export const API_PREFIX = 'api';

/** Default HTTP port when PORT env is not set. */
export const DEFAULT_PORT = 3001;

/** Build auth cookie path from prefix and version. Must match route prefix for refresh. */
export function getAuthCookiePath(
  apiPrefix: string,
  apiVersion: string,
): string {
  return `/${apiPrefix}/v${apiVersion}/auth`;
}

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

  const apiPrefix = config.get<string>('API_PREFIX') ?? API_PREFIX;
  const apiVersion = config.get<string>('API_VERSION') ?? '1';
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: apiVersion,
  });
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  const corsOrigins = config.get<string>('CORS_ORIGINS');
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  if (isProduction && !corsOrigins?.trim()) {
    throw new Error(
      'CORS_ORIGINS is required in production. Set a comma-separated list of allowed origins.',
    );
  }
  const origin = corsOrigins?.trim()
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
