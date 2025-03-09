import { Injectable } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';

import { ModelProvider } from '../../core/models/model.provider';

@Injectable()
export class ChatDbService {
  constructor(private readonly modelProvider: ModelProvider) {}

  async transformReport() {}
}
