import 'dotenv/config';
import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  const env = process.env.NODE_ENV ?? 'development';
  const sampleRateEnv = process.env.SENTRY_TRACES_SAMPLE_RATE;
  const tracesSampleRate =
    sampleRateEnv != null
      ? Number(sampleRateEnv)
      : env === 'production'
        ? 0.1
        : 1.0;
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? env,
    tracesSampleRate: Math.max(0, Math.min(1, tracesSampleRate)),
  });
}
