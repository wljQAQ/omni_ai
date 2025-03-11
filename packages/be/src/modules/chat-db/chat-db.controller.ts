import { Controller, Get, Post } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { jsonSchemaToZod } from '@n8n/json-schema-to-zod';

import { McpClient } from '@/core/mcp-client';
import { getMcpServerDir } from '@/utils';

import { ModelProvider } from '../../core/models/model.provider';
import { ChatDbService } from './chat-db.service';

@Controller('ai/chat-db')
export class ChatDbController {
  constructor(
    private readonly chatDbService: ChatDbService,
    private readonly modelProvider: ModelProvider
  ) {}

  @Get('query')
  async transformReport() {
    const pgMcpServerPath = getMcpServerDir() + 'postgres/dist/index.js';
    const client = new McpClient();

    const mcp = await client.connect(pgMcpServerPath);

    const langchainTools = await client.getLangchainTools();

    const model = this.modelProvider.createModel('deepseek');

    const llmWithTools = model.bindTools(langchainTools);

    // const stream = await llmWithTools.stream('帮我去数据库种查一下低代码 文章的内容');

    // let result = '';

    // for await (const chunk of stream) {
    //   const content = chunk.content.toString();
    //   result += content;

    //   process.stdout.write(content);
    // }

    const result = await llmWithTools.invoke([
      new SystemMessage(
        '你要试图理解用户的意图，判断用户是否要对数据库进行查询，如果用户需要查找数据库，看一下你目前有什么工具可以调用，如果有，请调用工具不需要问用户是否调用，你直接调用就行，并理解调用后的返回结果，如果没有，请告诉用户你无法查询数据库'
      ),

      new HumanMessage('帮我查一下公司现在有多少人？他们的职位是什么'),
      new HumanMessage('你直接调用就行，有权限并且吧结果返回给我')
    ]);

    console.log(result.content);

    return result;
  }
}
