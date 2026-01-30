import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './modules';
import { validateEnv } from './config';
import { PrismaModule } from './core/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: (config.get<number>('THROTTLE_TTL') ?? 60) * 1000,
            limit: config.get<number>('THROTTLE_LIMIT') ?? 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
      forRoutes: [{ path: '*path', method: RequestMethod.ALL }], // path-to-regexp v8: named wildcard
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) =>
        ({
          secret: config.get<string>('JWT_SECRET') ?? 'change-me-in-production',
          signOptions: {
            expiresIn: config.get<string>('JWT_EXPIRES_IN') ?? '7d',
          },
        }) as JwtModuleOptions,
      inject: [ConfigService],
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
