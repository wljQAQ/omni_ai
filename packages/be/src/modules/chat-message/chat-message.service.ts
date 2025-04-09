import { Injectable } from '@nestjs/common';

import { ModelProvider } from '@/core/models';

@Injectable()
export class ChatMessageService {
  constructor(private readonly modelProvider: ModelProvider) {}

  async complete(messages: any[]) {
    const model = this.modelProvider.getBaseModel('deepseek');

    // model.enhancedStreamChat(messages, {
    //   onMessage: message => {
    //     console.log(message);
    //   }
    // });
  }
}
