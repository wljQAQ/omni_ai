import { writeFileSync } from 'node:fs';
import { Injectable } from '@nestjs/common';

import { parse } from '@babel/parser';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { connect, query } from 'mssql';

import { BaseModel, ModelProvider } from '@/core/models';
import { getTestDataDir } from '@/utils';

import { getAnalysisPrompt } from './prompt';

@Injectable()
export class ReportAnalysisService {
  model: BaseModel<BaseChatModel>;
  constructor(private readonly modelProvider: ModelProvider) {
    // this.connectDB();
    //吧 bid mylink 写入到文件中省的要一直去数据库查询
    // writeFileSync(getTestDataDir() + 'test.js', `export const test = '111';`);
    // console.log(2224);
  }

  async analyzeReport(columns: any[], rows: any[], userQuestion: string) {
    const data = {
      columns,
      rows,
      title: '客户同期对比',
      question: userQuestion
    };

    this.model = this.modelProvider.getBaseModel('deepseek');

    // const prompt = new SystemMessage({
    //   content: getAnalysisPrompt(data)
    // });
    const prompt = new SystemMessage({
      content: '你是什么模型？'
    });

    const stream = await this.model.streamChat([prompt]);

    console.log(this.model.model.name, 'this.model');
    return {
      model: this.model.model,
      stream
    };

    // let thinking = '';
    // let content = '';

    // for await (const chunk of stream) {
    //   if (chunk.additional_kwargs.reasoning_content) thinking += chunk.additional_kwargs.reasoning_content;
    //   if (chunk.content) content += chunk.content;
    // }

    // 1. 场景理解阶段
    // const sceneAnalysis = await this.analyzeScene(data, userQuestion);

    return;
    // 2. 分析策略制定
    // const analysisStrategy = await this.defineStrategy(sceneAnalysis);

    // 3. 数据洞察分析
    // const insights = await this.generateInsights(data, analysisStrategy);

    // 4. 结论与建议生成
    // const recommendations = await this.generateRecommendations(insights);
  }

  private async analyzeScene(data: any, userQuestion: string) {
    const prompt = new SystemMessage({
      content: `你是一位专业的数据分析总监。请基于以下信息快速分析：
      1. 报表标题：${JSON.stringify(data.metadata.title || '无标题')}
      2. 数据结构：${JSON.stringify(data.columns)}
      3. 用户问题：${userQuestion || '用户未提供具体问题'}
      4. 样本数据：${JSON.stringify(data.rows.slice(0, 5))}
      
      简明扼要地回答：
      1. 这是什么类型的报表？
      2. 属于哪个业务领域？
      3. 包含哪些关键指标？
      4. 用户可能关注哪些核心问题？`
    });

    const stream = await this.model.streamChat([prompt]);

    for await (const chunk of stream) {
      if (chunk.additional_kwargs.reasoning_content) console.log(chunk.additional_kwargs.reasoning_content);
      if (chunk.content) console.log(chunk.content);
    }
    return stream;
  }

  private async defineStrategy(sceneAnalysis: string) {
    const prompt = new SystemMessage({
      content: `基于场景分析结果：${sceneAnalysis}
      
      请制定分析策略：
      1. 需要关注的核心维度
      2. 适用的分析方法
      3. 建议的分析步骤
      4. 可能需要的数据转换
      5. 合适的可视化方式`
    });

    const response = await this.model.streamChat([prompt]);
    return response;
  }

  private async generateInsights(data: any, strategy: string) {
    // 根据策略生成分析代码
    const analysisCode = await this.generateAnalysisCode(strategy);

    // 执行分析
    const analyzeFunction = new Function('data', '');
    const analysisResults = analyzeFunction(data);

    // 解读分析结果
    const prompt = new SystemMessage({
      content: `基于分析结果：${JSON.stringify(analysisResults)}
      和分析策略：${strategy}
      
      请提供：
      1. 关键发现
      2. 异常情况
      3. 主要趋势
      4. 潜在问题
      5. 值得关注的机会`
    });

    const response = await this.model.chat([prompt]);
    return response;
  }

  private async generateRecommendations(insights: string) {
    const prompt = new SystemMessage({
      content: `基于数据分析洞察：${insights}
      
      请提供：
      1. 问题诊断和根因分析
      2. 具体可执行的改进建议
      3. 潜在风险提示
      4. 未来趋势预测
      5. 优先级建议
      
      建议应该是：
      - 具体可执行的
      - 有明确时间框架
      - 包含预期效果
      - 考虑实施成本和风险`
    });

    const response = await this.model.chat([prompt]);
    return response;
  }

  private async generateAnalysisCode(strategy: string) {
    const prompt = new SystemMessage({
      content: `基于分析策略：${strategy}
      
      请生成JavaScript分析代码，包含：
      1. 基础统计计算
      2. 趋势分析
      3. 对比分析
      4. 相关性分析
      5. 异常检测
      
      代码应返回结构化的分析结果。`
    });

    const response = await this.model.chat([prompt]);
    return response;
  }
}
