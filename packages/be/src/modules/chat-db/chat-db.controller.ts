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

    return llmWithTools.invoke('帮我去数据库种查一下低代码 文章的内容');
  }
}
