import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai';

export class OpenaiModel {
  model: ChatOpenAI<ChatOpenAICallOptions>;

  createModel() {
    if (this.model) return this.model;

    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.9,
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: 'https://api.zyai.online/v1'
      }
    });

    return this.model;
  }
}
