import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import appConfig, { TAppConfig } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config: TAppConfig = app.get(appConfig.KEY);
  await app.listen(config.port);
}
bootstrap();
