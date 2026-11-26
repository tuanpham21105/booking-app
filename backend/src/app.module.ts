import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AuthenticationModule, type Duration } from '@nestjs/authentication';
import { CommonModule } from './common/common.module';
import { jwtConfig } from './common/infrastructure/config';
import { HealthModule } from './modules/health';
import { UsersModule } from './modules/users';
import { AuthModule } from './modules/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CommonModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AuthenticationModule.forRootAsync({
      inject: [jwtConfig.KEY],
      useFactory: (jwt: ConfigType<typeof jwtConfig>) => ({
        accessToken: {
          key: jwt.secret,
          ttl: jwt.expiresIn as Duration,
        },
        refreshToken: {
          key: jwt.secret,
          ttl: jwt.refreshExpiresIn as Duration,
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
