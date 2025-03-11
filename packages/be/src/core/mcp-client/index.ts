import { DynamicStructuredTool } from '@langchain/core/tools';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { jsonSchemaToZod } from '@n8n/json-schema-to-zod';

export class McpClient {
  private client: Client;
  constructor() {}
  async connect(serverScriptPath: string) {
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverScriptPath, 'postgresql://postgres:123456@localhost:5432/blog']
    });

    this.client = new Client(
      { name: 'omni-ai', version: '0.0.1' },
      {
        capabilities: {}
      }
    );

    await this.client.connect(transport);

    return this.client;
  }

  async getLangchainTools(): Promise<DynamicStructuredTool[]> {
    const mcpTools = await this.client.listTools();

    const langchainTools = [];

    mcpTools.tools.forEach(i => {
      langchainTools.push(
        new DynamicStructuredTool({
          name: i.name,
          description: i.description,
          schema: jsonSchemaToZod(i.inputSchema),
          func: async input => {
            console.log(input, 'input');

            const res = await this.client.callTool({
              name: i.name,
              arguments: input as any
            });

            console.log(res, 'calltool');
            return JSON.stringify(res.content);
          }
        })
      );
    });

    return langchainTools;
  }
}
