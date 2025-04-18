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

import { ChatflowService, ChatMessageService, FlowStep } from './chat-message.service';
import { SessionManagerService } from './session-manager.service';

@Controller('ai/chat-message')
export class ChatMessageController {
  model: BaseModel<BaseChatModel>;
  constructor(
    private readonly modelProvider: ModelProvider,
    private readonly chatMessageService: ChatMessageService,
    private readonly chatFlowService: ChatflowService,
    private readonly sessionManager: SessionManagerService
  ) {}

  // @Post('complete2')
  // async complete(@Res() res, @Body() body: { model: string; query: string; context: any[] }) {
  //   // 设置 SSE 相关的响应头
  //   res.setHeader('Content-Type', 'text/event-stream');
  //   res.setHeader('Cache-Control', 'no-cache');
  //   res.setHeader('Connection', 'keep-alive');

  //   const chatflowStep = [
  //     {
  //       model: 'qwen-vl-max',
  //       title: '产品分析',
  //       id: 'product_analysis',
  //       contextFormatter: (context: any[]) => {
  //         return context.map(i => {
  //           return new HumanMessage({
  //             content: i.content
  //           });
  //         });
  //       }
  //     },
  //     {
  //       model: 'deepseek-r1',
  //       title: '生成vue代码',
  //       id: 'generate_vue_code'
  //     }
  //   ];

  //   const messages = body.context.map(i => {
  //     if (i.role === 'system') {
  //       return new SystemMessage({
  //         content: i.content
  //       });
  //     } else {
  //       return new HumanMessage({
  //         content: [i]
  //       });
  //     }
  //   });

  //   this.chatFlowService.executeFlow(chatflowStep, body.query, messages, res);

  //   const model = this.modelProvider.getBaseModel('deepseek', {
  //     model: body.model || 'qwen-vl-max'
  //   });

  //   this.model = model;

  //   const id = uuidv4();
  //   console.log(id, 'id');
  //   model.enhancedStreamChat({
  //     id,
  //     messages: [...messages, new HumanMessage({ content: body.query })],
  //     callbacks: {
  //       onMessage: message => {
  //         const response = {
  //           message: message,
  //           event: 'message',
  //           task_id: id
  //         };

  //         res.write(`data: ${JSON.stringify(response)}\n\n`);
  //         // res.write(
  //         //   `data: ${JSON.stringify({
  //         //     message
  //         //     // event: 'message'
  //         //   })}\n\n`
  //         // );
  //       },
  //       onError: error => {
  //         const response = {
  //           message: error.message,
  //           event: error.message === 'Aborted' ? 'message_stop' : 'error',
  //           task_id: id
  //         };

  //         res.write(`data: ${JSON.stringify(response)}\n\n`);
  //       },
  //       onFinish: () => {
  //         console.log('finish');
  //         res.write(
  //           `data: ${JSON.stringify({
  //             event: 'finish',
  //             task_id: id
  //           })}\n\n`
  //         );
  //         res.end();
  //       }
  //     }
  //   });
  // }

  @Post('complete')
  @ApiOperation({ summary: '执行AI对话（支持流程化或普通问答）' })
  async complete2(
    @Res() res,
    @Body()
    body: {
      model: string;
      query: string;
      context: any[];
      chatflow?: FlowStep[];
    }
  ) {
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 准备初始上下文消息
    const initialMessages = (body.context || []).map(i => {
      if (i.role === 'system') {
        return new SystemMessage({ content: [i] });
      } else {
        return new HumanMessage({ content: [i] });
      }
    });

    // 判断是否使用chatflow模式
    if (body.chatflow && body.chatflow.length > 0) {
      // 使用流程化处理，通过回调处理SSE
      await this.chatFlowService.executeFlow(
        body.chatflow, 
        body.query, 
        initialMessages,
        {
          onStepStart: (stepInfo) => {
            this.sendSseMessage(res, {
              event: 'step_start',
              ...stepInfo
            });
          },
          onStepEnd: (stepInfo) => {
            this.sendSseMessage(res, {
              event: 'step_end',
              ...stepInfo
            });
          },
          onMessage: (message) => {
            this.sendSseMessage(res, {
              event: 'message',
              ...message
            });
          },
          onError: (error) => {
            this.sendSseMessage(res, {
              event: 'error',
              ...error
            });
          },
          onFlowStart: (flowInfo) => {
            this.sendSseMessage(res, {
              event: 'flow_start',
              ...flowInfo
            });
          },
          onFlowEnd: (flowInfo) => {
            this.sendSseMessage(res, {
              event: 'flow_end',
              ...flowInfo
            });
            res.end(); // 结束响应
          }
        }
      );
    } else {
      // 使用普通问答模式
      await this.handleNormalChat(body.model, body.query, initialMessages, res);
    }
  }
  
  /**
   * 发送SSE消息的辅助方法
   */
  private sendSseMessage(res: Response, data: any): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * 处理普通的聊天问答
   */
  private async handleNormalChat(modelName: string, query: string, context: any[], @Res() res): Promise<void> {
    // 获取模型
    const model = this.modelProvider.getBaseModel('deepseek', {
      model: modelName
    });

    this.model = model;

    console.log(modelName, 'modelName');

    const id = uuidv4();

    // 执行模型流式调用
    model.enhancedStreamChat({
      id,
      messages: [...context, new HumanMessage({ content: query })],
      callbacks: {
        onMessage: message => {
          const response = {
            message: message,
            event: 'message',
            task_id: id
          };

          res.write(`data: ${JSON.stringify(response)}\n\n`);
        },
        onError: error => {
          console.log(error, 'errmsg');
          const response = {
            message: error.message,
            event: error.message === 'Aborted' ? 'message_stop' : 'error',
            task_id: id
          };

          res.write(`data: ${JSON.stringify(response)}\n\n`);
        },
        onFinish: metadata => {
          res.write(
            `data: ${JSON.stringify({
              event: 'finish',
              task_id: id,
              metadata
            })}\n\n`
          );
          res.end();
        }
      }
    });
  }

  @Post('stop')
  streamAbort(@Body() body: { id: string }) {
    //TODO 吧model搞成单例模式
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
