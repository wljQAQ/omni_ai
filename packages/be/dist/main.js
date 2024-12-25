"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const express_1 = require("express");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true
    });
    app.use((0, express_1.json)({ limit: '10mb' }));
    app.enableCors();
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map