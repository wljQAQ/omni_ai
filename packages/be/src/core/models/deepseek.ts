import { ChatDeepSeek, type ChatDeepSeekCallOptions } from '@langchain/deepseek';

import { BaseModel } from './base.model';

/**
 * deepseek全面兼容 openAI 所以直接用 langchain/openai
 */
//@ts-ignore
export class DeepseekModel extends BaseModel<ChatDeepSeek<ChatDeepSeekCallOptions>> {
  createModel() {
    const model = new ChatDeepSeek({
      modelName: this.config.model || 'deepseek-v3',
      temperature: 0.7,
      configuration: {
        baseURL: process.env.DEEPSEEK_BASE_URL
        // baseURL: process.env.SILICONFLOW_BASE_URL
      },
      apiKey: process.env.DEEPSEEK_API_KEY,
      streamUsage: true
      // apiKey: process.env.SILICONFLOW_API_KEY
    });

    return model;
  }
}
