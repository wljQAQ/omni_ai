import { Injectable } from '@nestjs/common';

import type { BaseChatModel, BaseChatModelCallOptions } from '@langchain/core/language_models/chat_models';

import { DeepseekModel, OllamaModel } from '.';
import { BaseModelConfig } from './base.model';

@Injectable()
export class ModelProvider {
  createModel(modelName?: string, config?: BaseModelConfig): BaseChatModel<BaseChatModelCallOptions> {
    if (!modelName) modelName = 'ollama';
    switch (modelName) {
      case 'deepseek':
        return new DeepseekModel().createModel();
      case 'ollama':
        return new OllamaModel().createModel();
      default:
        return new DeepseekModel().createModel();
    }
  }
}
