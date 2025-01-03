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
      model: 'qwen-vl-max-latest',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '图片里面有什么'
            },
            {
              type: 'image_url',
              image_url: {
                url: 'https://bailian-bmp-prod.oss-cn-beijing.aliyuncs.com/model_offline_result/10546811/1735200077476/qianwen/Snipaste_2024-12-26_16-01-02.png?Expires=1735200725&OSSAccessKeyId=STS.NSqin292LyV3ayNAfEd1XCJRR&Signature=zVcY%2FLTNt5Hsy0LWnaLB3JExxFI%3D&security-token=CAIS2AJ1q6Ft5B2yfSjIr5DEItSG1O1tzpTYY1%2F%2FpWYQaL50rI%2F5sDz2IHhMenRoAu8fv%2FU1nmlQ6%2FsZlrp6SJtIXleCZtF94oxN9h2gb4fb41VsA0Os0s%2FLI3OaLjKm9u2wCryLYbGwU%2FOpbE%2B%2B5U0X6LDmdDKkckW4OJmS8%2FBOZcgWWQ%2FKBlgvRq0hRG1YpdQdKGHaONu0LxfumRCwNkdzvRdmgm4NgsbWgO%2Fks0CD0w2rlLFL%2BdugcsT4MvMBZskvD42Hu8VtbbfE3SJq7BxHybx7lqQs%2B02c5onDXgEKvEzXYrCOq4UycVRjE6IgHKdIt%2FP7jfA9sOHVnITywgxOePlRWjjRQ5ql0E4ehBQP3yBTn9%2FVTJeturjnXvGd24i0cWg2u2oBMhytfsq8tbjo7uXGa%2FbB1hmjSUyYUMumi%2BluDkYtlgzV9eKArlL3Sa2Rv041BsVRNCtAXxqAAZ13zoNdkHNJSoeWb7YwYIsk4%2Bx2UqpHM40ylW8Q64Sy0TlDk%2F%2FbYoZ6WEhqgzRdbMRLem%2Bedqua%2FHnkrFet1A4PAmGiWbeDiAf8Tw7wHvpJaWI9uxJ%2FHwrp%2Fan0L3oCLuB63jrf183W%2BLZGj4X4DEyMpF8xfcCDVsjKG8QKMnc8IAA%3D'
              }
            }
          ]
        },
        {
          role: 'assistant',
          content:
            '这张图片展示了一段关于如何管理图像的说明，特别是针对Chat Completions API。内容提到，与Assistants API不同，Chat Completions API没有状态，这意味着用户需要自行管理传递给模型的消息（包括图像）。如果需要多次向模型传递同一张图像，每次请求API时都必须重新传递该图像。\n\n对于长时间运行的对话，建议通过URL而不是base64格式传递图像，以减少延迟。此外，为了进一步提高模型的性能，可以提前将图像尺寸缩小到预期的最大尺寸以下。对于低分辨率模式，期望的图像尺寸为512px x 512px；对于高分辨率模式，图像的短边应小于768px，长边应小于2000px。\n\n处理完图像后，图像将从OpenAI服务器中删除且不会保留。OpenAI强调他们不会使用通过OpenAI API上传的数据来训练他们的模型。'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '这张图片的背景颜色是什么'
            }
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
    });

    try {
      for await (const chunk of completion) {
        res.write(`data: ${JSON.stringify({ content: chunk.choices[0]?.delta?.content })}\n\n`);
      }
    } catch (error) {
      console.error('Error in code conversion:', error);
      res.write(`data: ${JSON.stringify({ error: 'An error occurred during code conversion' })}\n\n`);
    } finally {
      res.end();
    }
  }
}
