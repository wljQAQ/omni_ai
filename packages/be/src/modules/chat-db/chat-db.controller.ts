import { Controller, Get, Post } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';

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

    await client.connect(pgMcpServerPath);

    console.log(pgMcpServerPath, 'pgMcpServerPath1');

    const model = this.modelProvider.createModel();

    return model.chat([
      new HumanMessage({
        content: [
          {
            type: 'image_url',
            image_url: { url: 'https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20241022/emyrja/dog_and_girl.jpeg' }
          },
          { type: 'text', text: '这是什么？' }
        ]
      })
    ]);

    return 11;
  }
}
