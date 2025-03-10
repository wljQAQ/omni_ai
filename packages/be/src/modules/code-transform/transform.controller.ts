/**
 * 代码转换
 * 旧通用报表转新低代码js
 */

import { join } from 'node:path';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { HuggingFaceEmbedding } from '@/core/embedding-engines';
import { RAGSystem } from '@/core/rag-system';
import { getModelsDir, getTestDataDir } from '@/utils/path';

import { mylinkList } from './data';
import { TransformService } from './transform.service';

@Controller('ai/code-transform')
export class TransformController {
  private ragSystem: RAGSystem;
  constructor(private readonly transformService: TransformService) {
    this.ragSystem = new RAGSystem();
  }

  @Get('addCodeTransformExample')
  async transformReport() {
    //1.导入知识库
    const docPath = join(getTestDataDir(), 'export.csv');
    await this.ragSystem.addCodeTransformExample();

    return 'success';
  }

  @Get('search')
  async search() {
    const result = await this.ragSystem.similaritySearch('领航一部 和 领航二部');
    return result;
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @Post('chat')
  async chat(@Body() body: { message: string }) {
    const { message } = body;

    const result = await this.ragSystem.similaritySearch(message);

    console.log(result, 'result');
    const chatResult = await this.transformService.transformReport([
      new SystemMessage({
        content: `你是一个智能助手。请根据以下参考信息回答用户的问题。
如果参考信息中没有足够内容来回答问题，请直接表明你不知道。
不要编造答案，只使用提供的参考信息。`
      }),
      new HumanMessage({
        content: `参考信息:\n${result.map((item: any) => item.content).join('\n')}\n\n用户问题: ${message}`
      })
    ]);

    console.log(chatResult.content, 'chatResult');
    return chatResult.content;
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        oldCode: { type: 'string' }
      }
    }
  })
  @Post('transform-code')
  async transformCode(@Body() body: { oldCode: string }) {
    //1.导入code transform example知识库
    //2.找到最相似的代码转换例子  这个找寻的方法有几个方案
    //2.1 使用vector store + rerank 找到最相似的代码 + 转换例子
    //2.2 agent 让ai 做这个找寻 让他先对代码进行类比归类，把代码归类成几种 比如 basic_window_open: 基本窗口打开模式 conditional_modal: 条件判断打开模态框 complex_logic: 复杂逻辑处理
    //3.使用相似的代码转换例子进行代码转换

    //2.1尝试使用vector store + rerank 找到最相似的代码 + 转换例子
    const { oldCode } = body;
    // Find similar examples
    const num = Math.floor(Math.random() * mylinkList.length);

    //先随便拿一个
    const { myFunc, bid } = mylinkList[num];

    console.log(bid, '当前选中的bid');

    const similarExample = await this.ragSystem.similaritySearch(myFunc);

    const similarestExample = similarExample[0] as any;

    const result = await this.transformService.transformReport([
      new SystemMessage({
        content: `你是一个代码转换专家。请将旧的JavaScript代码转换为新格式，遵循以下规则：

    1. 将函数签名从MyLink(m, field, value)更改为MyLink(e: Api)
    2. 用e.data属性访问替换DOM操作(getObj, getVal)
    3. 将URL字符串转换为this.$util.openWin/openModal的结构化对象,并且去除原本的URL提取其中bid转成pid
    4. 使用e.colDef.field代替field字符串比较  e.colDef.field 是列的字段名
    5. 使用现代ES6+语法
    6. 保持业务逻辑不变

    **重要提示：请返回完整的代码，不要省略任何部分，不要使用省略号(...)。生成的代码必须是可以直接运行的，只需要返回代码，不要返回其他内容。**

    参考以下类似的例子：
    oldCode:
    ${similarestExample.content}

    newCode:
    ${similarestExample.content}
    `
      }),
      new HumanMessage({
        content: `Transform this old code to the new format:\n\`\`\`javascript\n${oldCode}\n\`\`\``
      })
    ]);
    return {
      chatResult: result.content,
      token: result.usage_metadata,
      origin: mylinkList[num],
      similarestExample
    };
  }
}
