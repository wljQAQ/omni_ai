import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Response } from 'express';
import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    convertOldCodeStream(body: {
        oldCode: string;
    }, res: Response): Promise<void>;
    chat(body: {
        messages: Array<HumanMessage | SystemMessage>;
    }, res: Response): Promise<void>;
    generateVueCodeFromImage(body: {
        imageBase64: string;
    }, res: Response): Promise<void>;
}
