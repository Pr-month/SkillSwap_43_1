import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import appConfig, { TAppConfig } from './app.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config: TAppConfig = app.get(appConfig.KEY);
  await app.listen(config.port);
}

void bootstrap();
