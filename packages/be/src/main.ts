import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { json } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  const config = new DocumentBuilder()
    .setTitle('omniai')
    .setDescription('omniai API description')
    .setVersion('1.0')
    .addTag('omniai')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // app.setGlobalPrefix('api/');

  app.use(json({ limit: '10mb' }));

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
