import { Global, Module } from '@nestjs/common';

import { ModelProvider } from './model.provider';

export * from './deepseek';
export * from './openai';
export * from './ollama';
export * from './qwen';

@Global()
@Module({
  providers: [ModelProvider],
  exports: [ModelProvider]
})
export class ModelModule {}
