"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepseekModel = void 0;
const manager_1 = require("@langchain/core/callbacks/manager");
const openai_1 = require("@langchain/openai");
class DeepseekModel {
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
                else {
                    console.log('未能获取 Token 使用信息');
                }
            },
            handleLLMError(error) {
                console.error('LLM 错误:', error);
            }
        });
        this.model = new openai_1.ChatOpenAI({
            modelName: 'deepseek-chat',
            temperature: 0.2,
            openAIApiKey: process.env.DEEPSEEK_API_KEY,
            configuration: {
                baseURL: 'https://api.deepseek.com/v1'
            },
            callbacks: callbacks
        });
        return this.model;
    }
}
exports.DeepseekModel = DeepseekModel;
//# sourceMappingURL=deepseek.js.map