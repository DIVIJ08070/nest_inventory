import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './Common/AllExceptional/allexceptional.filter';
import { SuccessInterceptor } from './Common/Success/success.interceptor';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes();
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new SuccessInterceptor());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  const config = new DocumentBuilder()
    .setTitle('my inventory')
    .setDescription(
      'this are all apis for prodcuct,orders,categories and login enjoy',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
