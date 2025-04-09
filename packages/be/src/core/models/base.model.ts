/**
 * 基础模型抽象类
 */

import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { XMLParser } from 'fast-xml-parser';

// const xmlParser = new XMLParser({
//   trimValues: true
// });

// const content = xmlParser.parse(
//   `
// <chart-type>bar</chart-type>
// <chart-option>
// {
//   "title": {
//     "text": "客户同期金额与数量对比",
//     "left": "center"
//   },
//   "tooltip": {
//     "trigger": "axis",
//     "axisPointer": {
//       "type": "shadow"
//     },
//     "formatter": "{b} {a0}: {c0}元<br/>{a1}: {c1}件<br/>{a2}: {c2}%<br/>{a3}: {c3}%"
//   },
//   "legend": {
//     "data": ["本年金额", "上年金额", "金额同比增长", "数量同比增长"],
//     "bottom": "bottom"
//   },
//   "grid": {
//     "left": "3%",
//     "right": "4%",
//     "bottom": "15%",
//     "containLabel": true
//   },
//   "xAxis": {
//     "type": "category",
//     "data": ["1J·河南新上利公司(混合)", "3X·浙江启扬(直营)"]
//   },
//   "yAxis": [
//     {
//       "type": "value",
//       "name": "金额(元)",
//       "position": "left"
//     },
//     {
//       "type": "value",
//       "name": "增长率(%)",
//       "position": "right",
//       "axisLabel": {
//         "formatter": "{value}%"
//       }
//     }
//   ],
//   "series": [
//     {
//       "name": "本年金额",
//       "type": "bar",
//       "data": [686063.17, 558573],
//       "itemStyle": {
//         "color": "#5470C6"
//       }
//     },
//     {
//       "name": "上年金额",
//       "type": "bar",
//       "data": [240421.11, 232140],
//       "itemStyle": {
//         "color": "#91CC75"
//       }
//     },
//     {
//       "name": "金额同比增长",
//       "type": "line",
//       "yAxisIndex": 1,
//       "data": [185.3589, 140.619],
//       "symbol": "circle",
//       "symbolSize": 8,
//       "itemStyle": {
//         "color": "#EE6666"
//       },
//       "label": {
//         "show": true,
//         "formatter": "{c}%",
//         "position": "top"
//       }
//     },
//     {
//       "name": "数量同比增长",
//       "type": "line",
//       "yAxisIndex": 1,
//       "data": [184.2013, 130.664],
//       "symbol": "diamond",
//       "symbolSize": 8,
//       "itemStyle": {
//         "color": "#FAC858"
//       },
//       "label": {
//         "show": true,
//         "formatter": "{c}%",
//         "position": "top"
//       }
//     }
//   ]
// }
// </chart-option>
// `
// );

// console.log(content);

export interface BaseModelConfig {
  model?: string;
  apiKey?: string;
  baseURL?: string;
}

export abstract class BaseModel<Model extends BaseChatModel> {
  config: BaseModelConfig = {};
  model: BaseChatModel;
  streamAbortMap: Map<string, AbortController | null>;

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

    stream.cancel;

    return stream;
  }

  async enhancedStreamChat({
    id,
    messages,
    callbacks
  }: {
    id: string;
    messages: Array<HumanMessage | SystemMessage>;
    callbacks?: {
      onMessage: (message: any) => void;
      onFinish?: () => void;
      onError?: (error: Error) => void;
    };
  }) {
    try {
      const abortController = new AbortController();

      this.streamAbortMap.set(id, abortController);

      const model = this.createModel();

      this.model = model;
      const stream = await model.stream(messages, {
        signal: abortController.signal
      });

      const bufferSize = 10; // 保持一个合理的缓冲区大小

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
              // 首先尝试直接解析为JSON
              const trimmedContent = content.trim();
              // 使用正则表达式提取标签内容
              const typeMatch = trimmedContent.match(/<chart-type>(.*?)<\/chart-type>/s);
              const optionMatch = trimmedContent.match(/<chart-option>([\s\S]*?)<\/chart-option>/s);

              const result: any = {};

              if (typeMatch && typeMatch[1]) {
                result.type = typeMatch[1].trim();
              }

              if (optionMatch && optionMatch[1]) {
                // 直接解析JSON字符串
                const optionStr = optionMatch[1].trim();
                result.option = JSON.parse(optionStr);
              }

              return {
                message_type: 'chart',
                message: result,
                status: 'fulfilled'
              };
            } catch (e) {
              // 解析失败时返回原始内容
              return {
                message_type: 'chart',
                message: content,
                status: 'error'
              };
            }
          }
        },
        {
          pattern: /<lilanz-code>(.*?)<\/lilanz-code>/s,
          startPattern: '<lilanz-code>',
          endPattern: '</lilanz-code>',
          formatType: 'code',
          startMessage() {
            return {
              message_type: 'code',
              message: null,
              status: 'pending'
            };
          },
          endMessage(content: string) {
            const trimmedContent = content.trim();

            const typeMatch = trimmedContent.match(/<code-title>(.*?)<\/code-title>/s);
            const descriptionMatch = trimmedContent.match(/<code-description>(.*?)<\/code-description>/s);
            const languageMatch = trimmedContent.match(/<code-language>(.*?)<\/code-language>/s);
            const contentMatch = trimmedContent.match(/<code-content>([\s\S]*?)<\/code-content>/s);

            return {
              message_type: 'code',
              message: {
                title: typeMatch?.[1]?.trim(),
                description: descriptionMatch?.[1]?.trim(),
                language: languageMatch?.[1]?.trim(),
                content: contentMatch?.[1]?.trim()
              },
              status: 'fulfilled'
            };
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
    } catch (error) {
      callbacks?.onError?.(error as Error);
    } finally {
      console.log('finally');
      this.streamAbortMap.delete(id);
    }
  }

  streamAbort(id: string) {
    const abortController = this.streamAbortMap.get(id);
    if (abortController) {
      abortController.abort();
    }
  }
}
