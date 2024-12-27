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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyController = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("./openai");
const study_service_1 = require("./study.service");
let StudyController = class StudyController {
    constructor(studyService) {
        this.studyService = studyService;
    }
    async getOpenai() {
        const completion = await openai_1.openai.chat.completions.create({
            model: 'qwen-vl-max-latest',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: '图片里面有什么'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: 'https://bailian-bmp-prod.oss-cn-beijing.aliyuncs.com/model_offline_result/10546811/1735200077476/qianwen/Snipaste_2024-12-26_16-01-02.png?Expires=1735200725&OSSAccessKeyId=STS.NSqin292LyV3ayNAfEd1XCJRR&Signature=zVcY%2FLTNt5Hsy0LWnaLB3JExxFI%3D&security-token=CAIS2AJ1q6Ft5B2yfSjIr5DEItSG1O1tzpTYY1%2F%2FpWYQaL50rI%2F5sDz2IHhMenRoAu8fv%2FU1nmlQ6%2FsZlrp6SJtIXleCZtF94oxN9h2gb4fb41VsA0Os0s%2FLI3OaLjKm9u2wCryLYbGwU%2FOpbE%2B%2B5U0X6LDmdDKkckW4OJmS8%2FBOZcgWWQ%2FKBlgvRq0hRG1YpdQdKGHaONu0LxfumRCwNkdzvRdmgm4NgsbWgO%2Fks0CD0w2rlLFL%2BdugcsT4MvMBZskvD42Hu8VtbbfE3SJq7BxHybx7lqQs%2B02c5onDXgEKvEzXYrCOq4UycVRjE6IgHKdIt%2FP7jfA9sOHVnITywgxOePlRWjjRQ5ql0E4ehBQP3yBTn9%2FVTJeturjnXvGd24i0cWg2u2oBMhytfsq8tbjo7uXGa%2FbB1hmjSUyYUMumi%2BluDkYtlgzV9eKArlL3Sa2Rv041BsVRNCtAXxqAAZ13zoNdkHNJSoeWb7YwYIsk4%2Bx2UqpHM40ylW8Q64Sy0TlDk%2F%2FbYoZ6WEhqgzRdbMRLem%2Bedqua%2FHnkrFet1A4PAmGiWbeDiAf8Tw7wHvpJaWI9uxJ%2FHwrp%2Fan0L3oCLuB63jrf183W%2BLZGj4X4DEyMpF8xfcCDVsjKG8QKMnc8IAA%3D'
                            }
                        }
                    ]
                },
                {
                    role: 'assistant',
                    content: '这张图片展示了一段关于如何管理图像的说明，特别是针对Chat Completions API。内容提到，与Assistants API不同，Chat Completions API没有状态，这意味着用户需要自行管理传递给模型的消息（包括图像）。如果需要多次向模型传递同一张图像，每次请求API时都必须重新传递该图像。\n\n对于长时间运行的对话，建议通过URL而不是base64格式传递图像，以减少延迟。此外，为了进一步提高模型的性能，可以提前将图像尺寸缩小到预期的最大尺寸以下。对于低分辨率模式，期望的图像尺寸为512px x 512px；对于高分辨率模式，图像的短边应小于768px，长边应小于2000px。\n\n处理完图像后，图像将从OpenAI服务器中删除且不会保留。OpenAI强调他们不会使用通过OpenAI API上传的数据来训练他们的模型。'
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: '这张图片的背景颜色是什么'
                        }
                    ]
                }
            ]
        });
        console.log(completion.choices[0].message);
        return completion.choices[0].message;
    }
};
exports.StudyController = StudyController;
__decorate([
    (0, common_1.Get)('openai'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudyController.prototype, "getOpenai", null);
exports.StudyController = StudyController = __decorate([
    (0, common_1.Controller)('study'),
    __metadata("design:paramtypes", [study_service_1.StudyService])
], StudyController);
//# sourceMappingURL=study.controller.js.map