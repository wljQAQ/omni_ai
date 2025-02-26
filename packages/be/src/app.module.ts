import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModelModule } from './core/models';
import { TransformModule } from './modules/code-transform/transform.module';
import { StudyModule } from './study/study.module';

@Module({
  imports: [ConfigModule.forRoot(), ModelModule, AiModule, StudyModule, TransformModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
