import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModelModule } from './core/models';
import { ChatDbModule } from './modules/chat-db/chat-db.module';
import { TransformModule } from './modules/code-transform/transform.module';
import { ReportAnalysisModule } from './modules/report-analysis/analysis.module';

@Module({
  imports: [ConfigModule.forRoot(), ModelModule, TransformModule, ChatDbModule, ReportAnalysisModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
