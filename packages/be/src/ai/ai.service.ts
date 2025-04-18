import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { DeepseekModel, OpenaiModel, QwenModel } from './model';
import { getConvertOldCodePrompt } from './prompt';
import { getDSLPrompt, pmPrompt, systemPrompt } from './prompts/lowcode_prompt';

@Injectable()
export class AiService {
  private model: DeepseekModel;
  private imageBase64: string;
  constructor() {
    this.model = new DeepseekModel();
    // const imageBuffer = fs.readFileSync(path.resolve(__dirname, '../../image_2.png'));
    // this.imageBase64 = imageBuffer.toString('base64');
  }

  /**
   * 将旧的代码转换为新的代码  目前只支持MyLink方法
   * @param oldCode
   * @returns
   */
  async *convertOldCodeStream(oldCode: string) {
    //创建model

    const model = new QwenModel().createModel();

    const prompt = getConvertOldCodePrompt();

    const chain = prompt.pipe(model);

    const stream = await chain.stream({ oldCode });

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  async *chat(messages: Array<HumanMessage | SystemMessage>) {
    let pmAnalysis = '';
    for await (const chunk of this.pmAnalyse(messages)) {
      yield chunk;
      pmAnalysis += chunk;
    }
    // 2. 提取物料清单
    const materialsMatch = pmAnalysis.match(/\[(.*?)\]/);
    const materials = materialsMatch ? (JSON.parse(materialsMatch[0]) as string[]) : [];

    const dslMessages = [
      new SystemMessage(getDSLPrompt(pmAnalysis, materials)),
      new HumanMessage({
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${this.imageBase64}`,
              detail: 'high'
            }
          }
        ]
      })
    ];

    for await (const chunk of this.generateLowCode(dslMessages)) {
      yield chunk;
    }
  }

  /**
   * 产品经理分析 根据图片和描述生成需求文档
   * @param image 图片base64数据
   * @param description 描述
   * @returns 需求文档
   */
  async *pmAnalyse(messages: Array<HumanMessage | SystemMessage>) {
    const prompt = [
      new SystemMessage(pmPrompt),
      new HumanMessage({
        // @ts-ignore
        // content: messages.filter(item => item?.type === 'image_url')
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${this.imageBase64}`,
              detail: 'high'
            }
          }
        ]
      })
    ];

    const model = new QwenModel().createModel();

    const stream = await model.stream(prompt);

    for await (const chunk of stream) {
      yield chunk.content;
    }
  }

  async *generateLowCode(messages: Array<HumanMessage | SystemMessage>) {
    const model = new QwenModel();
    const stream = await model.createModel().stream(messages);
    for await (const chunk of stream) {
      yield chunk.content;
    }
  }

  /**
   * 根据图片生成Vue3代码
   * @param imageBase64 图片base64数据
   * @returns 生成的Vue3代码
   */
  async *generateVueCodeFromImage(imageBase64: string) {
    const model = new QwenModel();

    const messages = [
      new SystemMessage(`你是一位专业的前端开发工程师，精通Vue3和Ant Design Vue组件库。
    请你扮演一个设计稿转代码的AI助手，遵循以下规则：
    
    1. 仔细分析用户提供的设计图片
    2. 输出代码时遵循以下格式：
       - 使用Vue3 <script setup>语法
       - 使用Element Plus UI库
       - 代码结构分为template、script、style三部分
       - 确保代码可以直接运行
    3. 代码规范：
       - 使用TypeScript
       - 组件命名采用PascalCase
       - Props和事件采用camelCase
    4. 布局要求：
       - 优先使用Flex布局
       - 响应式设计
       - 准确还原间距和对齐
    5. 组件使用：
       - 优先使用Element Plus内置组件
       - 合理使用Layout、Space、Flex等布局组件
       - 正确使用Form、Table等复杂组件
    
    请直接输出代码，无需解释。`),
      new HumanMessage({
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageBase64,
              detail: 'high'
            }
          },
          {
            type: 'text',
            text: '请将这个设计稿转换为Vue3代码。'
          }
        ]
      })
    ];

    const stream = await model.chat(messages);

    for await (const chunk of stream) {
      yield chunk.content;
    }
  }
}
