import { ChatOllama } from '@langchain/ollama';

import { BaseModel } from './base.model';

export class OllamaModel extends BaseModel<ChatOllama> {
  createModel() {
    const model = new ChatOllama({
      baseUrl: 'http://localhost:11434',
      model: this.config.model || 'deepseek-r1:7b',
      temperature: 0.2
    });

    return model;
  }
}
