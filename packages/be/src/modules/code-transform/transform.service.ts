import { Injectable } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { ModelProvider } from '@/core/models/model.provider';

@Injectable()
export class TransformService {
  constructor(private readonly modelProvider: ModelProvider) {}

  async transformReport(message: Array<HumanMessage | SystemMessage>) {
    const model = this.modelProvider.createModel();

    return model.chat(message);
  }
}
