import { StudyService } from './study.service';
export declare class StudyController {
    private readonly studyService;
    constructor(studyService: StudyService);
    getOpenai(): Promise<import("openai/resources").ChatCompletionMessage>;
}
