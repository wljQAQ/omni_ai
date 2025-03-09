/**
 * 代码转换
 * 旧通用报表转新低代码js 模块
 */

import { Module } from '@nestjs/common';

import { ChatDbController } from './chat-db.controller';
import { ChatDbService } from './chat-db.service';

@Module({
  controllers: [ChatDbController],
  providers: [ChatDbService]
})
export class ChatDbModule {}
