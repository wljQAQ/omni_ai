/**
 * 报表分析
 * 旧通用报表转新低代码js
 */

import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { v4 as uuidv4 } from 'uuid';

import { BaseModel, ModelProvider } from '@/core/models';

@Controller('ai/chat-message')
export class ChatMessageController {
  model: BaseModel<BaseChatModel>;
  constructor(private readonly modelProvider: ModelProvider) {}

  @Post('complete')
  async complete(@Res() res, @Body() body: { model: string; query: string; context: any[] }) {
    // 设置 SSE 相关的响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const model = this.modelProvider.getBaseModel('deepseek', {
      model: body.model || 'qwen-vl-max'
    });

    this.model = model;

    const messages = body.context.map(i => {
      if (i.role === 'system') {
        return new SystemMessage({
          content: i.content
        });
      } else {
        return new HumanMessage({
          content: [...i.content, ...(i?.context || [])]
        });
      }
    });

    const id = uuidv4();

    model.enhancedStreamChat({
      id,
      messages: [...messages, new HumanMessage({ content: body.query })],
      callbacks: {
        onMessage: message => {
          const response = {
            message: message,
            event: 'message',
            task_id: id
          };

          res.write(`data: ${JSON.stringify(response)}\n\n`);
          // res.write(
          //   `data: ${JSON.stringify({
          //     message
          //     // event: 'message'
          //   })}\n\n`
          // );
        },
        onError: error => {
          console.log(error, 'error');
          const response = {
            message: error.message,
            event: error.name === 'AbortError' ? 'message_stop' : 'error',
            task_id: id
          };

          res.write(`data: ${JSON.stringify(response)}\n\n`);
        },
        onFinish: () => {
          console.log('finish');
          res.write(
            `data: ${JSON.stringify({
              event: 'finish',
              task_id: id
            })}\n\n`
          );
          res.end();
        }
      }
    });
  }

  @Post('stop')
  streamAbort(@Body() body: { id: string }) {
    if (!this.model) {
      return {
        errmsg: 'model not found',
        code: 1
      };
    }

    this.model.streamAbort(body.id);

    return {
      data: 'success',
      code: 0
    };
  }
}
