/**
 * 报表分析
 * 旧通用报表转新低代码js
 */

import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { BaseModel, ModelProvider } from '@/core/models';

import { ReportAnalysisService } from './analysis.service';
import { getReportChartPrompt } from './prompt';

@Controller('ai/report-analysis')
export class ReportAnalysisController {
  model: BaseModel<BaseChatModel>;
  constructor(
    private readonly service: ReportAnalysisService,
    private readonly modelProvider: ModelProvider
  ) {}

  @Post('analyze')
  @ApiOperation({ summary: '分析报表数据' })
  async analyzeReport(@Res() res, @Body() body) {
    // 设置 SSE 相关的响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const columns = [
      {
        field: 'khdm',
        headerName: '代码'
      },
      {
        field: 'khmc',
        headerName: '客户名'
      },
      {
        field: 'lxr',
        headerName: '联系人'
      },
      {
        field: 'mdl',
        headerName: '门店数'
      },
      {
        field: 'je',
        headerName: '金额'
      },
      {
        field: 'sl',
        headerName: '数量'
      },
      {
        field: 'bjje',
        headerName: '上浮金额'
      },
      {
        field: 'lsje',
        headerName: '吊牌金额'
      },
      {
        field: 'snsl',
        headerName: '上年同期数量'
      },
      {
        field: 'snje',
        headerName: '上年同期金额'
      },
      {
        field: 'slzb',
        headerName: '数量同期增减'
      },
      {
        field: 'jezb',
        headerName: '金额同期增减'
      },
      {
        field: 'cjds',
        headerName: '成交单量'
      },
      {
        field: 'kdl',
        headerName: '客单量'
      },
      {
        field: 'kdj',
        headerName: '客单价'
      },
      {
        field: 'pjzk',
        headerName: '上浮价平均折扣'
      },
      {
        field: 'lszk',
        headerName: '吊牌价平均折扣'
      },
      {
        field: 'tspjzk',
        headerName: '特殊品类平均折扣'
      }
    ];

    const rows = [
      {
        dxid: 186,
        khmc: '1J·河南新上利公司(混合)',
        snsl: 576,
        snje: 240421.11,
        lxr: '闫华先',
        khid: 186,
        lszk: 5.0712,
        bjje: 1352860,
        lsje: 1352860,
        kdj: 1036.349199,
        tspjzk: 0,
        kdl: 2.472809,
        jezb: 1.853589,
        mdl: 54,
        khdm: 'HN0032',
        slzb: 1.842013,
        cjds: 662,
        sl: 1637,
        je: 686063.17,
        pjzk: 5.0712
      },
      {
        dxid: 21353,
        khmc: '3X·浙江启扬(直营)',
        snsl: 512,
        snje: 232140,
        lxr: '刘洋',
        khid: 21353,
        lszk: 5.83862,
        bjje: 955965,
        lsje: 955965,
        kdj: 1466.070866,
        tspjzk: 4.67879,
        kdl: 3.099737,
        jezb: 1.40619,
        mdl: 33,
        khdm: 'ZJ0120',
        slzb: 1.30664,
        cjds: 381,
        sl: 1181,
        je: 558573,
        pjzk: 5.83862
      }
    ];

    const model = await this.service.analyzeReport(columns, rows, '分析一下当前报表');
    const data = {
      columns,
      rows,
      title: '客户同期对比',
      question: '分析一下当前报表'
    };

    const prompt = new SystemMessage({
      content: getReportChartPrompt(data)
    });

    // model.enhancedStreamChat([prompt], {
    //   onMessage: message => {
    //     console.log(message, 'message');

    //     res.write(`data: ${JSON.stringify(message)}\n\n`);
    //   },
    //   onFinish: () => {
    //     console.log('finish');
    //     res.end();
    //   }
    // });
    // const { stream, model } = await this.service.analyzeReport(columns, rows, '分析一下当前报表');

    // for await (const chunk of stream) {
    //   // if (chunk.additional_kwargs.reasoning_content) thinking += chunk.additional_kwargs.reasoning_content;
    //   // if (chunk.content) content += chunk.content;

    //   res.write(`data: ${JSON.stringify(formatChunk(chunk))}\n\n`);
    // }

    // res.end();

    // function formatChunk(chunk: AIMessageChunk) {
    //   return {
    //     model: model.name,
    //     sentenceList: [
    //       {
    //         reasoning_content: chunk.additional_kwargs.reasoning_content,
    //         content: chunk.content,
    //         role: 'assistant',
    //         type: 'text'
    //       }
    //     ]
    //   };
    // }
  }

  @Post('complete')
  async complete(@Res() res, @Body() body: { model: string; messages: any[] }) {
    // 设置 SSE 相关的响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const vision_model = 'qwen-vl-max';
    const text_model = 'deepseek-r1';

    const model = this.modelProvider.getBaseModel('deepseek', {
      model: body.model
    });

    const prompt = new SystemMessage({
      content: `你是一个专业、友好、有帮助的AI助手。请根据用户的问题提供准确、有用的回答。
  回答时请保持简洁明了，避免不必要的冗长。如果不确定或不知道答案，请诚实地说明，不要编造信息。并且用中文回答`
    });

    const mockprompt = new HumanMessage({
      content: [
        {
          type: 'text',
          text: `你是一位资深的Vue3和ElementPlus专家开发者。请根据以下详细的产品需求文档，生成完整的Vue3+ElementPlus实现代码。

产品需求文档:
"""
1. 页面布局
整体布局：页面分为顶部、主要内容区域和底部三个部分。
顶部：包含一个头像图标、标题文字和两个功能按钮（搜索和更多选项）。
主要内容区域：分为左右两列，左侧为"Hot Topics"，右侧为"Design Guide"。
底部：包含两个标签按钮，分别是"Hot Topics"和"Design Guide"。

2. 颜色和字体
背景颜色：#FFFFFF
文字颜色：
标题文字：#333333
子标题文字：#666666
按钮文字：#333333
字体：
标题文字：Arial, sans-serif, 24px
子标题文字：Arial, sans-serif, 18px
按钮文字：Arial, sans-serif, 16px

3. 具体模块尺寸和位置
头部
宽度：100%
高度：70px
头像图标：左上角，宽度50px，高度50px
标题文字：头像右侧，垂直居中对齐
功能按钮：右上角，宽度50px，高度50px，间距10px

主要内容区域
左侧"Hot Topics"
宽度：48%
高度：自适应
边框：1px solid #ECECEC
内边距：20px
子标题：宽度100%，高度50px，垂直居中对齐
按钮：宽度100%，高度50px，垂直居中对齐，间距10px

右侧"Design Guide"
宽度：48%
高度：自适应
边框：1px solid #ECECEC
内边距：20px
子标题：宽度100%，高度50px，垂直居中对齐
按钮：宽度100%，高度50px，垂直居中对齐，间距10px

底部
宽度：100%
高度：50px
标签按钮：宽度48%，高度50px，垂直居中对齐，间距10px

4. 功能描述
搜索按钮：点击后弹出搜索框，用户可以输入关键词进行搜索。
更多选项按钮：点击后展开更多功能选项。
Hot Topics：展示热门话题，点击子标题或按钮跳转到对应内容页面。
Design Guide：展示设计指南，点击子标题或按钮跳转到对应内容页面。
"""

请提供以下文件的完整实现代码：
1. 主组件（App.vue）
2. 必要的子组件（Header.vue, Content.vue, Footer.vue等）
3. 路由配置（如果需要）
4. 任何必要的工具函数或状态管理

要求：
1. 代码必须使用Vue3的Composition API
2. 使用ElementPlus组件库的组件实现UI
3. 严格按照产品需求文档中的颜色、尺寸、布局规范实现
4. 所有功能（头部、内容区域、底部）都应在同一个Vue文件中实现
5. 代码结构应清晰，使用适当的CSS变量和命名来保持可维护性
6. 提供适当的注释说明关键逻辑
7. 确保在不同设备上有良好的响应式表现

请生成一个完整的、可直接使用的单文件组件代码，包含<template>、<script setup>和<style>部分。`
        }
      ]
    });

    const messages = body.messages.map(i => {
      if (i.role === 'system') {
        return new SystemMessage({
          content: i.content
        });
      } else {
        return new HumanMessage({
          content: [...i.content, ...(i?.context || [])]
        });
      }
    });

    // model.enhancedStreamChat([...messages], {
    //   onMessage: message => {
    //     res.write(`data: ${JSON.stringify(message)}\n\n`);
    //   },
    //   onFinish: () => {
    //     console.log('finish');
    //     res.end();
    //   }
    // });
  }
}
