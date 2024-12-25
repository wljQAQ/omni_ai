import { CallbackManager } from '@langchain/core/callbacks/manager';
import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai';

import type { BaseModelProvider } from './interface';

export class OpenaiModel implements BaseModelProvider<ChatOpenAI<ChatOpenAICallOptions>> {
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
        } else {
          console.log('未能获取 Token 使用信息');
        }
      },
      handleLLMError(error) {
        console.error('LLM 错误:', error);
      }
    });

    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.2,
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: 'https://api.zyai.online/v1'
      },
      callbacks: callbacks
    });

    return this.model;
  }
}
