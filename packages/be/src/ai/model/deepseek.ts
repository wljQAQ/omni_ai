import { CallbackManager } from '@langchain/core/callbacks/manager';
import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai';

import type { BaseModelProvider } from './interface';

/**
 * deepseek全面兼容 openAI 所以直接用 langchain/openai
 */

export class DeepseekModel implements BaseModelProvider<ChatOpenAI<ChatOpenAICallOptions>> {
  model: ChatOpenAI<ChatOpenAICallOptions>;

  createModel() {
    if (this.model) return this.model;

    this.model = new ChatOpenAI({
      modelName: 'deepseek-chat',
      temperature: 0.2,
      openAIApiKey: process.env.DEEPSEEK_API_KEY,
      configuration: {
        baseURL: 'https://api.deepseek.com/v1'
      }
    });

    return this.model;
  }
}
