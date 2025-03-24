import { Injectable } from '@nestjs/common';

import type { BaseChatModel, BaseChatModelCallOptions } from '@langchain/core/language_models/chat_models';

import { BaseModel, DeepseekModel, OllamaModel } from '.';
import { BaseModelConfig } from './base.model';

@Injectable()
export class ModelProvider {
  private modelInstances: Map<string, BaseModel<BaseChatModel>> = new Map();

  /**
   * 创建或获取模型实例
   */
  getBaseModel(modelType?: string, config?: BaseModelConfig): BaseModel<BaseChatModel> {
    modelType = modelType || 'ollama';

    // 生成唯一键，用于缓存模型实例
    const key = this.generateModelKey(modelType, config);

    // 如果已经有缓存的实例，直接返回
    if (this.modelInstances.has(key)) {
      return this.modelInstances.get(key)!;
    }

    // 创建新实例
    let model: BaseModel<BaseChatModel>;

    switch (modelType) {
      case 'deepseek':
        model = new DeepseekModel(config);
        break;
      case 'ollama':
        model = new OllamaModel(config);
        break;
      default:
        model = new DeepseekModel(config);
    }

    // 缓存实例
    this.modelInstances.set(key, model);

    return model;
  }

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

  /**
   * 生成模型缓存的唯一键
   */
  private generateModelKey(modelType: string, config?: BaseModelConfig): string {
    if (!config) return modelType;

    // 使用模型类型和配置生成唯一键
    return `${modelType}-${JSON.stringify(config)}`;
  }

  /**
   * 清除缓存的模型实例
   */
  clearModelCache(modelType?: string): void {
    if (modelType) {
      // 清除特定类型的模型
      for (const key of this.modelInstances.keys()) {
        if (key.startsWith(modelType)) {
          this.modelInstances.delete(key);
        }
      }
    } else {
      // 清除所有模型
      this.modelInstances.clear();
    }
  }
}
