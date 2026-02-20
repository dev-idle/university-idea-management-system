import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { configureApp, DEFAULT_PORT } from './config';
import { runSeed } from './core/seed';

async function bootstrap(): Promise<void> {
  if (process.env.RUN_SEED === '1') {
    await runSeed();
    process.exit(0);
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  configureApp(app);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? DEFAULT_PORT;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application listening on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
