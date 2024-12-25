"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QwenModel = void 0;
const manager_1 = require("@langchain/core/callbacks/manager");
const openai_1 = require("@langchain/openai");
class QwenModel {
    createModel() {
        if (this.model)
            return this.model;
        const callbacks = manager_1.CallbackManager.fromHandlers({
            handleLLMEnd(output) {
                const tokenUsage = output.llmOutput?.tokenUsage;
                if (tokenUsage) {
                    const { promptTokens, completionTokens, totalTokens } = tokenUsage;
                    console.log('Token 使用详情:', {
                        输入消耗: promptTokens,
                        输出消耗: completionTokens,
                        总计: totalTokens
                    });
                }
            },
            handleLLMError(error) {
                console.error('LLM 错误:', error);
            }
        });
        this.model = new openai_1.ChatOpenAI({
            modelName: 'qwen-vl-max-latest',
            temperature: 0.7,
            openAIApiKey: process.env.QWEN_API_KEY,
            configuration: {
                baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
                defaultHeaders: {
                    Authorization: `Bearer ${process.env.QWEN_API_KEY}`
                }
            },
            callbacks
        });
        return this.model;
    }
    async chat(messages) {
        const model = this.createModel();
        try {
            const response = await model.stream(messages);
            return response;
        }
        catch (error) {
            console.error('聊天出错:', error);
            throw error;
        }
    }
}
exports.QwenModel = QwenModel;
//# sourceMappingURL=qwen.js.map