import { ChatOllama } from '@langchain/ollama';
import type { BaseModelProvider } from './interface';
export declare class OllamaModel implements BaseModelProvider<ChatOllama> {
    model: ChatOllama;
    createModel(): ChatOllama;
}
