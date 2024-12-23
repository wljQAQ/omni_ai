import { Injectable } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { DeepseekModel, OllamaModel, QwenModel } from './model';
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

    const model = new QwenModel().createModel();

    const prompt = getConvertOldCodePrompt();

    const chain = prompt.pipe(model);

    const stream = await chain.stream({ oldCode });

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  async chat(messages: Array<HumanMessage | SystemMessage>) {
    const model = new QwenModel();
    return model.chat(messages);
  }
}
