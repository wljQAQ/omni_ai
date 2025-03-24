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
}
