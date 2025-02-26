import { createReadStream } from 'node:fs';
import { Body, Controller, Get, Post, Res, Sse } from '@nestjs/common';

import { Response } from 'express';

import { openai } from './openai';
import { StudyService } from './study.service';

@Controller('study')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('openai')
  async getOpenai() {
    const completion = await openai.chat.completions.create({
      // model: 'qwen-vl-max-latest',
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: 'https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20241022/emyrja/dog_and_girl.jpeg' }
            },
            { type: 'text', text: '这是什么？' }
          ]
        }
      ]
    });

    console.log(completion.choices[0].message);
    return completion.choices[0].message;
  }

  @Get('test')
  async test() {
    console.log(123123);
    const completion = await openai.chat.completions.create({
      model: 'qwen-vl-max-latest',
      messages: [
        {
          role: 'user',
          content: 'Say this is a test'
        }
      ],
      temperature: 0.7
    });
    console.log(completion, 'completion');

    //返回结果如下
    const result = {
      choices: [
        {
          message: {
            content: 'This is a test.',
            role: 'assistant'
          },
          finish_reason: 'stop',
          index: 0,
          logprobs: null
        }
      ],
      object: 'chat.completion',
      usage: {
        prompt_tokens: 24,
        completion_tokens: 5,
        total_tokens: 29
      },
      created: 1735699609,
      system_fingerprint: null,
      model: 'qwen-vl-max-latest',
      id: 'chatcmpl-973bc0ba-1992-9148-ba88-4a80f1195c54'
    };

    return completion;
  }

  @Get('testStream')
  async testStream() {
    const completion = await openai.chat.completions.create({
      model: 'qwen-vl-max-latest',
      messages: [
        {
          role: 'user',
          content: 'Say this is a test'
        }
      ],
      stream: true
    });

    for await (const chunk of completion) {
      process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }

    return completion;
  }

  @Post('chat')
  async chat(@Body() body: { messages: string }, @Res() res: Response) {
    console.log(body.messages, 'messages');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const completion = await openai.chat.completions.create({
      model: 'qwen-vl-max-latest',
      messages: [
        {
          role: 'user',
          content: body.messages
        }
      ],
      stream: true
      // stream_options: {
      //   include_usage: true
      // }
    });
    try {
      for await (const chunk of completion) {
        const data = {
          role: 'assistant',
          type: 'answer',
          content: chunk.choices[0]?.delta?.content,
          content_type: 'text'
        };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    } catch (error) {
      console.error('Error in code conversion:', error);
      res.write(`data: ${JSON.stringify({ error: 'An error occurred during code conversion' })}\n\n`);
    } finally {
      res.end();
    }
  }
}
