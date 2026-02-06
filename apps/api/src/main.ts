import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configPromise } from '@sous/config';
import { logger } from '@sous/logger';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const config = await configPromise;
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('sous.tools API')
    .setDescription('The core intelligence API for the sous.tools platform.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  
  app.getHttpAdapter().get('/reference-json', (req: any, res: any) => {
    res.json(document);
  });

  app.use(
    '/reference',
    apiReference({
      configuration: {
        spec: {
          content: document,
        },
      },
    } as any),
  );

  logger.info(`🚀 API starting on port ${config.api.port}...`);
  await app.listen(config.api.port, '0.0.0.0');
  logger.info(`✅ API is live at http://localhost:${config.api.port}`);
  logger.info(`📚 Documentation available at http://localhost:${config.api.port}/reference`);
}
bootstrap();
