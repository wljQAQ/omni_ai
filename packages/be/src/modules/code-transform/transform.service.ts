import { Injectable } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { ModelProvider } from '../../core/models/model.provider';

@Injectable()
export class TransformService {
  constructor(private readonly modelProvider: ModelProvider) {}

  async transformReport() {
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
  }
}
