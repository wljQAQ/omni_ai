import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai';
import type { BaseModelProvider } from './interface';
export declare class QwenModel implements BaseModelProvider<ChatOpenAI<ChatOpenAICallOptions>> {
    model: ChatOpenAI<ChatOpenAICallOptions>;
    createModel(): ChatOpenAI<ChatOpenAICallOptions>;
    chat(messages: Array<HumanMessage | SystemMessage>): Promise<import("@langchain/core/dist/utils/stream").IterableReadableStream<import("@langchain/core/messages").AIMessageChunk>>;
}
