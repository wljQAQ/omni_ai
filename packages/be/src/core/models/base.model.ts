/**
 * 基础模型抽象类
 */

import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export interface BaseModelConfig {
  model?: string;
  apiKey?: string;
  baseURL?: string;
}

export abstract class BaseModel<Model extends BaseChatModel> {
  config: BaseModelConfig = {};
  model: BaseChatModel;

  constructor(config?: BaseModelConfig) {
    this.config = config || {};
  }

  abstract createModel(): Model;

  chat(messages: Array<HumanMessage | SystemMessage>) {
    const model = this.createModel();

    // model.bindTools([]);

    return model.invoke(messages);
  }

  async streamChat(messages: Array<HumanMessage | SystemMessage>) {
    const model = this.createModel();

    this.model = model;
    const stream = await model.stream(messages);

    return stream;
  }

  async enhancedStreamChat(
    messages: Array<HumanMessage | SystemMessage>,
    callbacks?: {
      onMessage: (message: any) => void;
      onFinish?: () => void;
    }
  ) {
    const model = this.createModel();

    this.model = model;
    const stream = await model.stream(messages);

    const bufferSize = 100; // 保持一个合理的缓冲区大小

    // 内置的一些格式
    const formatDetectors = [
      {
        pattern: /<lilanz-chart>(.*?)<\/lilanz-chart>/s,
        startPattern: '<lilanz-chart>',
        endPattern: '</lilanz-chart>',
        formatType: 'chart',
        startMessage() {
          return {
            message_type: 'chart',
            message: null,
            status: 'pending'
          };
        },
        endMessage(content: string) {
          try {
            // 尝试解析为JSON
            const chartData = JSON.parse(content.trim());
            return {
              message_type: 'chart',
              message: chartData,
              status: 'complete'
            };
          } catch (e) {
            // 解析失败时返回原始内容
            return {
              message_type: 'chart',
              message: content,
              status: 'complete'
            };
          }
        }
      }
    ];

    // 内容缓冲区
    let contentBuffer = '';

    // 正在处理中的特殊格式
    let activeFormat: {
      type: string;
      startIndex: number;
      detector: (typeof formatDetectors)[0];
      pendingSent: boolean;
    } | null = null;

    // 检查缓冲区中是否有特殊格式的开始标记
    const checkForFormatStart = () => {
      if (activeFormat) return false; // 已有活跃格式时不检查新格式

      for (const detector of formatDetectors) {
        const startIndex = contentBuffer.indexOf(detector.startPattern);
        if (startIndex !== -1) {
          // 发送开始标记之前的普通文本
          if (startIndex > 0) {
            callbacks?.onMessage({
              message_type: 'text',
              message: contentBuffer.substring(0, startIndex),
              status: 'complete'
            });
          }

          // 标记当前活跃的格式
          activeFormat = {
            type: detector.formatType,
            startIndex: startIndex,
            detector: detector,
            pendingSent: false
          };

          return true;
        }
      }
      return false;
    };

    // 检查缓冲区中是否有特殊格式的结束标记
    const checkForFormatEnd = () => {
      if (!activeFormat) return false;

      const { detector, startIndex } = activeFormat;
      const startPatternEnd = startIndex + detector.startPattern.length;
      const endIndex = contentBuffer.indexOf(detector.endPattern, startPatternEnd);

      if (endIndex !== -1) {
        // 找到结束标记
        const formatContent = contentBuffer.substring(startPatternEnd, endIndex);

        // 发送完成的格式消息
        callbacks?.onMessage(detector.endMessage(formatContent));

        // 更新缓冲区，移除已处理的内容
        contentBuffer = contentBuffer.substring(endIndex + detector.endPattern.length);

        // 重置活跃格式
        activeFormat = null;

        return true;
      } else if (!activeFormat.pendingSent) {
        // 没找到结束标记但尚未发送pending状态
        callbacks?.onMessage(detector.startMessage());
        activeFormat.pendingSent = true;
      }

      return false;
    };

    // 处理普通文本 - 平衡流畅性和检测能力
    const processNormalText = () => {
      if (!activeFormat && contentBuffer.length > 0) {
        // 保留一部分缓冲区以检测可能跨chunks的特殊格式
        const reserveSize = Math.min(contentBuffer.length, bufferSize / 2);

        if (contentBuffer.length > reserveSize) {
          // 发送部分文本，保留部分用于检测
          const sendText = contentBuffer.substring(0, contentBuffer.length - reserveSize);
          callbacks?.onMessage({
            message_type: 'text',
            message: sendText,
            status: 'complete'
          });

          // 更新缓冲区
          contentBuffer = contentBuffer.substring(contentBuffer.length - reserveSize);
        }
      }
    };

    let result = '';
    // 主处理循环
    for await (const chunk of stream) {
      // 处理推理内容
      const reasoning_content = chunk.additional_kwargs?.reasoning_content;

      // 回复的内容
      const content = chunk.content;

      result += content;

      console.log(content);

      // 推理的一般都是在最前面，并且此时不存在content，先处理
      if (reasoning_content) {
        callbacks?.onMessage({
          message_type: 'reasoning',
          message: reasoning_content
        });
        continue;
      }

      // 添加内容到缓冲区
      if (content) contentBuffer += content;

      // 处理特殊格式
      let formatProcessed = false;

      // 先检查是否有格式结束
      formatProcessed = checkForFormatEnd();

      // 如果没有处理结束标记，则检查是否有新的格式开始
      if (!formatProcessed) {
        formatProcessed = checkForFormatStart();
      }

      // 无论是否检测到格式，都处理普通文本
      // 但如果有活跃格式，processNormalText不会发送内容
      processNormalText();

      // 防止缓冲区过大（安全措施）
      if (!activeFormat && contentBuffer.length > bufferSize * 2) {
        const sendText = contentBuffer.substring(0, contentBuffer.length - bufferSize);
        callbacks?.onMessage({
          message_type: 'text',
          message: sendText,
          status: 'complete'
        });
        contentBuffer = contentBuffer.substring(contentBuffer.length - bufferSize);
      }
    }

    // 处理流结束时缓冲区中的剩余内容
    if (contentBuffer.length > 0) {
      callbacks?.onMessage({
        message_type: 'text',
        message: contentBuffer,
        status: 'complete'
      });
    }

    // 调用完成回调
    callbacks?.onFinish?.();
  }

  formatMessage() {}
}
