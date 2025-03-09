import { Controller, Get, Post } from '@nestjs/common';

import { McpClient } from '@/core/mcp-client';
import { getMcpServerDir } from '@/utils';

import { ChatDbService } from './chat-db.service';

@Controller('ai/chat-db')
export class ChatDbController {
  constructor(private readonly chatDbService: ChatDbService) {}

  @Get('query')
  async transformReport() {
    const pgMcpServerPath = getMcpServerDir() + 'postgres/dist/index.js';
    const client = new McpClient();

    await client.connect(pgMcpServerPath);

    console.log(pgMcpServerPath, 'pgMcpServerPath1');

    return 11;
  }
}
