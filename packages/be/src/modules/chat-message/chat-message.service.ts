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

@Injectable()
export class ChatflowService {
  constructor(private readonly modelProvider: ModelProvider) {}

  async executeFlow(
    steps: Array<{
      model: string;
      provider: string;
      systemPrompt: string;
      inputFormatter: (data: any) => string;
    }>,
    initialInput: any,
    callbacks: any
  ) {
    let currentInput = initialInput;

    for (const step of steps) {
      // 执行每个步骤并更新输入
      const model = this.modelProvider.getBaseModel(step.provider, { model: step.model });
      const result = await this.executeStep(model, step, currentInput, callbacks);
      currentInput = result;
    }

    return currentInput;
  }

  private async executeStep(model, stepConfig, input, callbacks) {
    // 实现单个步骤的执行逻辑
  }
}
