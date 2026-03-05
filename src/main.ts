import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './Common/AllExceptional/allexceptional.filter';
import { SuccessInterceptor } from './Common/Success/success.interceptor';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes();
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new SuccessInterceptor());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
