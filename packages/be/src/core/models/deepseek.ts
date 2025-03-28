import { ChatDeepSeek, type ChatDeepSeekCallOptions } from '@langchain/deepseek';

import { BaseModel } from './base.model';

/**
 * deepseek全面兼容 openAI 所以直接用 langchain/openai
 */
//@ts-ignore
export class DeepseekModel extends BaseModel<ChatDeepSeek<ChatDeepSeekCallOptions>> {
  createModel() {
    console.log(process.env.SILICONFLOW_BASE_URL, process.env.SILICONFLOW_API_KEY);
    const model = new ChatDeepSeek({
      modelName: 'deepseek-ai/DeepSeek-V3',
      temperature: 0.2,
      configuration: {
        // baseURL: process.env.DEEPSEEK_BASE_URL
        baseURL: process.env.SILICONFLOW_BASE_URL
      },
      // apiKey: process.env.DEEPSEEK_API_KEY
      apiKey: process.env.SILICONFLOW_API_KEY
    });

    return model;
  }
}
