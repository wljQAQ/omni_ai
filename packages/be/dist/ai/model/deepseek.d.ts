import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai';
import type { BaseModelProvider } from './interface';
export declare class DeepseekModel implements BaseModelProvider<ChatOpenAI<ChatOpenAICallOptions>> {
    model: ChatOpenAI<ChatOpenAICallOptions>;
    createModel(): ChatOpenAI<ChatOpenAICallOptions>;
}
