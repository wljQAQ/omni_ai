import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
export interface BaseModelProvider<Model extends BaseChatModel> {
    model: Model;
    createModel(): Model;
}
