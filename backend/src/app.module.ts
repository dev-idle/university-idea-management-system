import { Module, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule, HealthModule } from './modules';
import { DepartmentsModule } from './modules/departments';
import { AcademicYearsModule } from './modules/academic-years';
import { MeModule } from './modules/me';
import { UsersModule } from './modules/users';
import { validateEnv } from './config';
import { PrismaModule } from './core/prisma/prisma.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

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
    LoggerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level:
            config.get<string>('NODE_ENV') !== 'production' ? 'debug' : 'info',
        },
        forRoutes: [
          { path: '*path', method: RequestMethod.ALL },
        ],
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (config: ConfigService) =>
        ({
          secret: config.get<string>('JWT_SECRET') ?? 'change-me-in-production',
          signOptions: {
            expiresIn: config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m',
          },
        }) as JwtModuleOptions,
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    MeModule,
    DepartmentsModule,
    AcademicYearsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
  ],
})
export class AppModule {}
