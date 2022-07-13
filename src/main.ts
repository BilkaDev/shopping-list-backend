import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors:true});

  app.useGlobalPipes(
      new ValidationPipe({
          // disableErrorMessages: true,
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
      }),
  );

  await app.listen(3002);
}
bootstrap();
