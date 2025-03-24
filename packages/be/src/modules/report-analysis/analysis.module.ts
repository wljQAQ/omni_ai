/**
 * 代码转换
 * 旧通用报表转新低代码js 模块
 */

import { Module } from '@nestjs/common';

import { ReportAnalysisController } from './analysis.controller';
import { ReportAnalysisService } from './analysis.service';

@Module({
  controllers: [ReportAnalysisController],
  providers: [ReportAnalysisService]
})
export class ReportAnalysisModule {}
