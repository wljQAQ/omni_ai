import { Controller, Get, Post } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { jsonSchemaToZod } from '@n8n/json-schema-to-zod';
import { z } from 'zod';

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

    // const llmWithTools = model.bindTools(langchainTools);

    const calculatorSchema = z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The type of operation to execute.'),
      number1: z.number().describe('The first number to operate on.'),
      number2: z.number().describe('The second number to operate on.')
    });

    const calculatorTool = tool(
      async ({ operation, number1, number2 }) => {
        console.log('我调用了tool:', operation, number1, number2);
        // Functions must return strings
        if (operation === 'add') {
          return `${number1 + number2}`;
        } else if (operation === 'subtract') {
          return `${number1 - number2}`;
        } else if (operation === 'multiply') {
          return `${number1 * number2}`;
        } else if (operation === 'divide') {
          return `${number1 / number2}`;
        } else {
          throw new Error('Invalid operation.');
        }
      },
      {
        name: 'calculator',
        description: 'Can perform mathematical operations.',
        schema: calculatorSchema
      }
    );

    const llmWithTools = model.bindTools([calculatorTool]);

    // const stream = await llmWithTools.stream('帮我去数据库种查一下低代码 文章的内容');

    // let result = '';

    // for await (const chunk of stream) {
    //   const content = chunk.content.toString();
    //   result += content;

    //   process.stdout.write(content);
    // }
    const messages = [new HumanMessage('3 * 12是多少')];

    const aiMessage = await llmWithTools.invoke(messages);

    const toolsByName = {
      calculator: calculatorTool
    };

    console.log(aiMessage.content);
    messages.push(aiMessage);

    for (const toolCall of aiMessage.tool_calls) {
      const selectedTool = toolsByName[toolCall.name];
      const toolMessage = await selectedTool.invoke(toolCall);
      console.log(toolMessage, 'toolMessage');
      messages.push(toolMessage);
    }

    const finalRes = await llmWithTools.invoke(messages);

    console.log(finalRes.content);

    return finalRes;

    // const result = await llmWithTools.invoke([
    //   new SystemMessage(
    //     '你要试图理解用户的意图，判断用户是否要对数据库进行查询，如果用户需要查找数据库，看一下你目前有什么工具可以调用，如果有，请调用工具不需要问用户是否调用，你直接调用就行，并理解调用后的返回结果，如果没有，请告诉用户你无法查询数据库'
    //   ),

    //   new HumanMessage('帮我查一下公司现在有多少人？他们的职位是什么'),
    //   new HumanMessage('你直接调用就行，有权限并且吧结果返回给我')
    // ]);

    // console.log(result.content);

    // return result;
  }
}
