/**
 * 代码转换
 * 旧通用报表转新低代码js 模块
 */

import { Module } from '@nestjs/common';

import { TransformController } from './transform.controller';
import { TransformService } from './transform.service';

@Module({
  controllers: [TransformController],
  providers: [TransformService]
})
export class TransformModule {}
