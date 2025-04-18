import { Response } from 'express';

/**
 * 响应适配器接口
 * 定义与客户端通信的标准方法
 */
export interface IResponseAdapter {
  // 发送普通消息
  sendMessage(message: any): void;

  // 发送错误信息
  sendError(error: any): void;

  // 发送特定事件
  sendEvent(eventName: string, data: any): void;

  // 开始流程
  beginFlow(flowId: string, totalSteps: number, stepsInfo: any[]): void;

  // 结束流程
  endFlow(flowId: string, summary?: any): void;

  // 开始步骤
  beginStep(flowId: string, stepInfo: any): void;

  // 结束步骤
  endStep(flowId: string, stepInfo: any, result?: any): void;

  // 完成响应
  complete(): void;
}

/**
 * SSE响应适配器
 * 实现通过Server-Sent Events进行通信
 */
export class SseResponseAdapter implements IResponseAdapter {
  constructor(private response: Response) {
    // 设置SSE响应头
    this.response.setHeader('Content-Type', 'text/event-stream');
    this.response.setHeader('Cache-Control', 'no-cache');
    this.response.setHeader('Connection', 'keep-alive');
  }

  /**
   * 通用的SSE消息发送方法
   */
  private sendSseMessage(data: any): void {
    this.response.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  sendMessage(message: any): void {
    this.sendSseMessage({
      event: 'message',
      message
    });
  }

  sendError(error: any): void {
    this.sendSseMessage({
      event: 'error',
      error: typeof error === 'string' ? error : error.message,
      details: error.details || error.stack
    });
  }

  sendEvent(eventName: string, data: any): void {
    this.sendSseMessage({
      event: eventName,
      ...data
    });
  }

  beginFlow(flowId: string, totalSteps: number, stepsInfo: any[]): void {
    this.sendSseMessage({
      event: 'flow_start',
      flow_id: flowId,
      totalSteps,
      steps: stepsInfo
    });
  }

  endFlow(flowId: string, summary?: any): void {
    this.sendSseMessage({
      event: 'flow_end',
      flow_id: flowId,
      summary
    });
  }

  beginStep(flowId: string, stepInfo: any): void {
    this.sendSseMessage({
      event: 'step_start',
      flow_id: flowId,
      step: stepInfo
    });
  }

  endStep(flowId: string, stepInfo: any, result?: any): void {
    this.sendSseMessage({
      event: 'step_end',
      flow_id: flowId,
      step: stepInfo,
      result
    });
  }

  complete(): void {
    this.response.end();
  }
}
