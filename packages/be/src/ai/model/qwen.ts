import { CallbackManager } from '@langchain/core/callbacks/manager';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai';

import type { BaseModelProvider } from './interface';

export class QwenModel implements BaseModelProvider<ChatOpenAI<ChatOpenAICallOptions>> {
  model: ChatOpenAI<ChatOpenAICallOptions>;

  createModel() {
    if (this.model) return this.model;

    const callbacks = CallbackManager.fromHandlers({
      handleLLMEnd(output) {
        const tokenUsage = output.llmOutput?.tokenUsage;
        if (tokenUsage) {
          const { promptTokens, completionTokens, totalTokens } = tokenUsage;
          console.log('Token 使用详情:', {
            输入消耗: promptTokens,
            输出消耗: completionTokens,
            总计: totalTokens
          });
        }
      },
      handleLLMError(error) {
        console.error('LLM 错误:', error);
      }
    });

    this.model = new ChatOpenAI({
      modelName: 'qwen-vl-max-latest', // 可选: qwen-max, qwen-plus, qwen-turbo
      temperature: 0.7,
      openAIApiKey: process.env.QWEN_API_KEY,
      configuration: {
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        defaultHeaders: {
          Authorization: `Bearer ${process.env.QWEN_API_KEY}`
        }
      },
      callbacks
    });

    return this.model;
  }

  async chat(messages: Array<HumanMessage | SystemMessage>) {
    const model = this.createModel();
    try {
      const response = await model.stream(messages);
      return response;
    } catch (error) {
      console.error('聊天出错:', error);
      throw error;
    }
  }
}
