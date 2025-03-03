import { env, pipeline } from '@huggingface/transformers';
import type { FeatureExtractionPipeline } from '@huggingface/transformers';

import { getModelsDir } from '@/utils/path';

import { BaseEmbedding } from './types';

/**
 * HuggingFace嵌入引擎配置选项
 */
export interface HuggingFaceEmbeddingOptions {
  /** 模型名称 */
  modelName?: string;
  /** 是否对向量进行归一化 */
  normalize?: boolean;
  /** 池化策略 */
  pooling?: 'mean' | 'none' | 'cls';
  /** 是否记录处理日志 */
  verbose?: boolean;
}

/**
 * 使用HuggingFace Transformers实现的嵌入引擎
 * 兼容LangChain Embeddings接口，可以与向量存储无缝集成
 */
export class HuggingFaceEmbedding extends BaseEmbedding {
  /** TransformersJS pipeline实例 */
  pipeline: FeatureExtractionPipeline;
  /** 是否已初始化 */
  private initialized = false;
  /** 配置选项 */
  private options: HuggingFaceEmbeddingOptions;

  constructor(options: HuggingFaceEmbeddingOptions = {}) {
    super({});
    this.options = {
      modelName: 'all-MiniLM-L6-v2',
      normalize: true,
      pooling: 'mean',
      verbose: false,
      ...options
    };
  }

  /**
   * 初始化模型pipeline
   * 设置环境变量并加载模型
   */
  async init() {
    // 如果已经初始化，直接返回
    if (this.initialized) return;

    // 配置环境变量
    env.allowLocalModels = true;
    env.allowRemoteModels = false;
    env.localModelPath = getModelsDir();

    // 创建特征提取pipeline
    this.pipeline = await pipeline('feature-extraction', this.options.modelName);
    this.initialized = true;
  }

  /**
   * 为一组文本生成嵌入向量
   * 实现LangChain Embeddings接口要求的方法
   * @param texts 待处理的文本数组
   * @returns 嵌入向量数组（二维数组）
   */
  async embedDocuments(texts: string[]) {
    const result = await Promise.all(texts.map(async text => (await this.embedding(text)).flat()));

    return result;
  }

  /**
   * 为单个查询文本生成嵌入向量
   * 实现LangChain Embeddings接口要求的方法
   * @param text 查询文本
   * @returns 嵌入向量（一维数组）
   */
  async embedQuery(text: string) {
    // 复用embedding方法，保持处理一致性
    const embedding = await this.embedding(text);
    // 将二维数组平铺为一维数组
    return embedding.flat();
  }

  async embedding(text: string) {
    // 确保pipeline已初始化
    await this.init();

    if (!this.pipeline) {
      throw new Error('pipeline未初始化');
    }

    // 使用pipeline处理文本
    // pooling:'mean'参数指定使用平均池化策略，对token嵌入取平均值得到文本嵌入
    // normalize:true参数确保输出的向量被归一化为单位长度，这对于余弦相似度计算很重要
    const embedding = await this.pipeline(text, {
      pooling: this.options.pooling,
      normalize: this.options.normalize
    });

    // 从模型输出中提取嵌入向量并转换为JavaScript数组
    return embedding.tolist();
  }
}
