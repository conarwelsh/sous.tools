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
    '/docs',
    apiReference({
      configuration: {
        spec: {
          content: document,
        },
        theme: 'moon', // Applying a dark theme
        customCss: `
          :root {
            --scalar-color-accent: #8B5CF6; /* Primary Violet */
            --scalar-color-accent-text: #FFFFFF; /* White text on accent */
            --scalar-color-text-normal: #F5F5F5; /* Light Grey */
            --scalar-color-text-muted: #737373; /* Medium Grey */
            --scalar-background-1: #171717; /* Dark Grey */
            --scalar-background-2: #262626; /* Slightly lighter dark grey for panels/hover */
            --scalar-border-color: #333333; /* Darker border */
            --scalar-color-warning: #FACC15; /* Yellow */
            --scalar-color-success: #22C55E; /* Green */
            --scalar-color-danger: #EF4444; /* Red */

            /* Fonts - Mimicking project setup */
            --scalar-font: 'Inter', sans-serif;
            --scalar-font-code: 'Geist Mono', monospace;
          }

          /* Injecting Logo */
          .scalar-header__logo {
            background-image: url('/images/logo.png'); /* Assuming logo is placed here */
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            width: 120px; /* Adjust as needed */
            height: 30px; /* Adjust as needed */
            margin-right: 16px; /* Spacing from brand name */
          }

          .scalar-header__title {
            /* Hide the default title if the logo is prominent */
            display: none;
          }

          /* Style for dark theme elements if necessary */
          body {
            background-color: var(--scalar-background-1);
            color: var(--scalar-color-text-normal);
          }
        `,
      },
    } as any),
  );

  logger.info(`🚀 API starting on port ${config.api.port}...`);
  await app.listen(config.api.port, '0.0.0.0');
  logger.info(`✅ API is live at http://localhost:${config.api.port}`);
  logger.info(
    `📚 Documentation available at http://localhost:${config.api.port}/docs`,
  );
}
bootstrap();
