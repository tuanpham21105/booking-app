import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { HealthModule } from './modules/health';
import { UsersModule } from './modules/users';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CommonModule, HealthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
