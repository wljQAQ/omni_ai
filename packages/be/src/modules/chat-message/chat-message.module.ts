/**
 * 代码转换
 * 旧通用报表转新低代码js 模块
 */

import { Module } from '@nestjs/common';

import { ChatMessageController } from './chat-message.controller';
import { ChatflowService, ChatMessageService } from './chat-message.service';

@Module({
  controllers: [ChatMessageController],
  providers: [ChatMessageService, ChatflowService]
})
export class ChatMessageModule {}
