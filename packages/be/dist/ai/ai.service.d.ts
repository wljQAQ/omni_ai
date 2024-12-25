import { HumanMessage, SystemMessage } from '@langchain/core/messages';
export declare class AiService {
    constructor();
    convertOldCodeStream(oldCode: string): AsyncGenerator<import("@langchain/core/messages").AIMessageChunk, void, unknown>;
    chat(messages: Array<HumanMessage | SystemMessage>): Promise<import("@langchain/core/dist/utils/stream").IterableReadableStream<import("@langchain/core/messages").AIMessageChunk>>;
    generateVueCodeFromImage(imageBase64: string): AsyncGenerator<import("@langchain/core/messages").MessageContent, void, unknown>;
}
