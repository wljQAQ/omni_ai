import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudyModule } from './study/study.module';

@Module({
  imports: [ConfigModule.forRoot(), AiModule, StudyModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
