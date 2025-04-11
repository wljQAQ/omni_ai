import { Injectable } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Response } from 'express';
import Handlebars from 'handlebars';
import { v4 as uuidv4 } from 'uuid';

import { BaseModel, ModelProvider } from '@/core/models';

@Injectable()
export class ChatMessageService {
  constructor(private readonly modelProvider: ModelProvider) {}

  async complete(messages: any[]) {
    const model = this.modelProvider.getBaseModel('deepseek');

    // model.enhancedStreamChat(messages, {
    //   onMessage: message => {
    //     console.log(message);
    //   }
    // });
  }
}

/**
 * 流程步骤定义接口
 */
export interface FlowStep {
  id: string; // 步骤唯一标识
  title: string; // 步骤标题
  model: string; // 使用的模型名称
  systemPrompt?: string; // 系统提示
  contextTemplate?: string; // 上下文模板，支持变量替换
}

@Injectable()
export class ChatflowService {
  constructor(private readonly modelProvider: ModelProvider) {}

  async executeFlow(steps: FlowStep[], query: string, context: any[] = [], res: Response): Promise<void> {
    const flowId = uuidv4();

    // 准备流程上下文
    const flowContext = {
      flowId,
      query,
      outputs: {},
      initialContext: context
    };

    // 发送流程开始通知
    this.sendSseMessage(res, {
      event: 'flow_start',
      flow_id: flowId,
      totalSteps: steps.length,
      steps: steps.map(s => ({ id: s.id, title: s.title }))
    });

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepNumber = i + 1;

        const stepId = uuidv4();

        // 发送步骤开始通知
        this.sendSseMessage(res, {
          event: 'step_start',
          flow_id: flowId,
          step: {
            id: step.id,
            step_id: stepId,
            title: step.title,
            current: stepNumber,
            total: steps.length
          }
        });

        try {
          // 执行单个步骤
          const output = await this.executeStep(step, flowContext, res);

          // 更新上下文
          flowContext.outputs[step.id] = output;

          // 发送步骤完成通知
          this.sendSseMessage(res, {
            event: 'step_end',
            task_id: flowId,
            step: {
              id: step.id,
              title: step.title,
              current: stepNumber,
              total: steps.length
            }
          });
        } catch (error) {
          // 发送步骤错误通知
          this.sendSseMessage(res, {
            event: 'step_error',
            task_id: flowId,
            step: {
              id: step.id,
              title: step.title
            },
            error: error.message
          });

          throw error; // 重新抛出错误以中断流程
        }
      }
    } catch (error) {}
  }

  /**
   * 执行单个流程步骤
   */
  private async executeStep(step: FlowStep, context: any, res: Response): Promise<string> {
    return new Promise((resolve, reject) => {
      // 构建消息上下文
      const messages = this.buildStepContext(step, context);
      let fullOutput = '';

      // 获取模型
      const model = this.modelProvider.getBaseModel('deepseek', { model: step.model });
      const stepId = uuidv4();

      // 执行模型流式调用
      model.enhancedStreamChat({
        id: stepId,
        messages,
        callbacks: {
          onMessage: message => {
            // 累积完整输出
            fullOutput += message;

            // 发送消息更新
            this.sendSseMessage(res, {
              event: 'message',
              task_id: context.flowId,
              stepId: step.id,
              chunk: message
            });
          },
          onError: error => {
            reject(error);
          },
          onFinish: () => {
            resolve(fullOutput);
          }
        }
      });
    });
  }

  /**
   * 构建步骤的消息上下文
   */
  private buildStepContext(step: FlowStep, context: any): any[] {
    const messages = [];

    // 添加系统提示（如果有）
    if (step.systemPrompt) {
      messages.push(new SystemMessage({ content: step.systemPrompt }));
    }

    // 处理上下文
    if (step.contextTemplate) {
      // 编译模板
      const template = Handlebars.compile(step.contextTemplate);

      // 准备模板数据
      const templateData = {
        query: context.query,
        outputs: context.outputs,
        // 可以添加更多辅助数据
        step: {
          id: step.id,
          title: step.title
        },
        // 添加一些辅助函数
        helpers: {
          formatOutput: output => output?.trim(),
          joinOutputs: outputs =>
            Object.entries(outputs)
              .map(([id, output]) => `${id}: ${output}`)
              .join('\n\n')
        }
      };

      // 渲染模板
      const content = template(templateData);
      messages.push(new HumanMessage({ content }));
    } else {
      // 添加初始上下文
      messages.push(...context.initialContext);

      // 如果有前一步输出，添加到上下文
      if (Object.keys(context.outputs).length > 0) {
        const template = Handlebars.compile(
          '{{#each outputs}}' + '{{@key}} 的结果：\n{{this}}\n\n' + '{{/each}}' + '基于以上内容，请回答：{{query}}'
        );

        const content = template({
          outputs: context.outputs,
          query: context.query
        });

        messages.push(new HumanMessage({ content }));
      } else {
        // 如果是第一步，直接使用查询
        messages.push(new HumanMessage({ content: context.query }));
      }
    }

    return messages;
  }

  /**
   * 发送SSE消息
   */
  private sendSseMessage(res: Response, data: any): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}
