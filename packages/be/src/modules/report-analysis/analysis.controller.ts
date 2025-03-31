/**
 * 报表分析
 * 旧通用报表转新低代码js
 */

import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { SystemMessage } from '@langchain/core/messages';

import { ReportAnalysisService } from './analysis.service';
import { getReportChartPrompt } from './prompt';

@Controller('ai/report-analysis')
export class ReportAnalysisController {
  constructor(private readonly service: ReportAnalysisService) {}

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

    model.enhancedStreamChat([prompt], {
      onMessage: message => {
        console.log(message, 'message');

        res.write(`data: ${JSON.stringify(message)}\n\n`);
      },
      onFinish: () => {
        console.log('finish');
        res.end();
      }
    });
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
}
