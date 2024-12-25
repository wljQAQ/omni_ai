"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async convertOldCodeStream(body, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        try {
            for await (const chunk of this.aiService.convertOldCodeStream(body.oldCode)) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }
        }
        catch (error) {
            console.error('Error in code conversion:', error);
            res.write(`data: ${JSON.stringify({ error: 'An error occurred during code conversion' })}\n\n`);
        }
        finally {
            res.end();
        }
    }
    async chat(body, res) {
        const response = await this.aiService.chat(body.messages);
        res.json(response);
    }
    async generateVueCodeFromImage(body, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        try {
            for await (const chunk of this.aiService.generateVueCodeFromImage(body.imageBase64)) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }
        }
        catch (error) {
            console.error('Error in code generation:', error);
            res.write(`data: ${JSON.stringify({ error: 'An error occurred during code generation' })}\n\n`);
        }
        finally {
            res.end();
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('convertOldCodeStream'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "convertOldCodeStream", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('generateVueCodeFromImage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateVueCodeFromImage", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map