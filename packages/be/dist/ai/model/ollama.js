"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaModel = void 0;
const ollama_1 = require("@langchain/ollama");
class OllamaModel {
    createModel() {
        this.model = new ollama_1.ChatOllama({
            baseUrl: 'http://localhost:11434',
            model: 'llama3.2-vision:11b',
            temperature: 0.2
        });
        return this.model;
    }
}
exports.OllamaModel = OllamaModel;
//# sourceMappingURL=ollama.js.map