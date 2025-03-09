import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class McpClient {
  constructor() {}
  async connect(serverScriptPath: string) {
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverScriptPath, 'postgresql://postgres:123456@localhost:5432/blog']
    });

    const client = new Client(
      { name: 'omni-ai', version: '0.0.1' },
      {
        capabilities: {}
      }
    );

    await client.connect(transport);

    //列出所有可用的工具
    const tools = await client.listTools();

    console.log('tools', tools);

    return client;
  }
}
