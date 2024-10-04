import { Injectable } from '@nestjs/common';

import { OpenaiModel } from './model/openai';
import { getConvertOldCodePrompt } from './prompt';

@Injectable()
export class AiService {
  constructor() {}

  /**
   * 将旧的代码转换为新的代码  目前只支持MyLink方法
   * @param oldCode
   * @returns
   */
  async *convertOldCodeStream(oldCode: string) {
    //创建model

    const model = new OpenaiModel().createModel();

    const prompt = getConvertOldCodePrompt();

    const chain = prompt.pipe(model);

    const stream = await chain.stream({ oldCode });

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}
