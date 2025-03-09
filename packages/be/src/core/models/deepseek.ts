import { CallbackManager } from '@langchain/core/callbacks/manager';
import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai';

import { BaseModel } from './base.model';
import type { BaseModelProvider } from './interface';

/**
 * deepseek全面兼容 openAI 所以直接用 langchain/openai
 */

//@ts-ignore
export class DeepseekModel extends BaseModel<ChatOpenAI<ChatOpenAICallOptions>> {
  createModel() {
    const model = new ChatOpenAI({
      modelName: 'deepseek-r1:7b',
      temperature: 0.2,
      // openAIApiKey: process.env.DEEPSEEK_API_KEY,
      configuration: {
        baseURL: 'http://localhost:11434'
      }
    });

    return model;
  }
}
