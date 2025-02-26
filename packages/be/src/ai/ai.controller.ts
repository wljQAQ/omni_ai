import { Body, Controller, Get, Post, Res, Sse } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Response } from 'express';

import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('convertOldCodeStream')
  async convertOldCodeStream(@Body() body: { oldCode: string }, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const chunk of this.aiService.convertOldCodeStream(body.oldCode)) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
    } catch (error) {
      console.error('Error in code conversion:', error);
      res.write(`data: ${JSON.stringify({ error: 'An error occurred during code conversion' })}\n\n`);
    } finally {
      res.end();
    }
  }

  @Post('chat')
  async chat(@Body() body: { messages: Array<HumanMessage | SystemMessage> }, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const chunk of this.aiService.chat(body.messages)) {
        const data = {
          role: 'assistant',
          type: 'answer',
          content: chunk,
          content_type: 'text'
        };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    } catch (error) {
      console.error('Error in code generation:', error);
      res.write(`data: ${JSON.stringify({ error: 'An error occurred during code generation' })}\n\n`);
    } finally {
      res.end();
    }
  }

  @Post('generateVueCodeFromImage')
  async generateVueCodeFromImage(@Body() body: { image: string }, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const chunk of this.aiService.generateVueCodeFromImage(body.image)) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
    } catch (error) {
      console.error('Error in code generation:', error);
      res.write(`data: ${JSON.stringify({ error: 'An error occurred during code generation' })}\n\n`);
    } finally {
      res.end();
    }
  }
}
