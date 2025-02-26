/**
 * 代码转换
 * 旧通用报表转新低代码js
 */

import { Controller, Get, Post } from '@nestjs/common';

import { TransformService } from './transform.service';

@Controller('ai/code-transform')
export class TransformController {
  constructor(private readonly transformService: TransformService) {}

  @Get('report')
  async transformReport() {
    return this.transformService.transformReport();
  }
}
