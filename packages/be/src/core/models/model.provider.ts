import { Injectable } from '@nestjs/common';

import { DeepseekModel, OllamaModel } from '.';
import { BaseModelConfig } from './base.model';

@Injectable()
export class ModelProvider {
  createModel(modelName?: string, config?: BaseModelConfig) {
    if (!modelName) modelName = 'ollama';
    switch (modelName) {
      case 'deepseek':
        return new DeepseekModel(config);
      case 'ollama':
        return new OllamaModel(config);
      default:
        return new DeepseekModel(config);
    }
  }
}
