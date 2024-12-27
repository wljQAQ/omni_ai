"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const https_proxy_agent_1 = require("https-proxy-agent");
const openai_1 = require("openai");
const proxyUrl = 'http://127.0.0.1:7890';
const httpsAgent = new https_proxy_agent_1.HttpsProxyAgent(proxyUrl);
const key = 'sk-ed8a086971b04386943df8f46bbb67b7';
exports.openai = new openai_1.default({
    apiKey: key,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});
//# sourceMappingURL=openai.js.map