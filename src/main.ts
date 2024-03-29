import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { GlobalExceptionFilter } from "./filters/global-exception.filter";
import * as cookieParser from "cookie-parser";
import { ApiTransformInterceptor } from "./interceptors/api-transform.interceptors";
import { CONFIG } from "./config/client-config";

const checkEnvironment = () => {
  const errorsMessages: string[] = [];
  /** ENV FOR CONNECT WITH DATABASE*/
  if (!process.env.DB_TYPE) errorsMessages.push("environment variable name=DB_TYPE not specified");
  if (!process.env.DB_HOST) errorsMessages.push("environment variable name=DB_HOST not specified");
  if (!process.env.DB_USERNAME) errorsMessages.push("environment variable name=DB_USERNAME not specified");
  if (!process.env.DB_PASSWORD) errorsMessages.push("environment variable name=DB_PASSWORD not specified");
  if (!process.env.DB_DATABASE) errorsMessages.push("environment variable name=DB_DATABASE not specified");
  /** ENV FOR CONNECT WITH CLIENT*/
  if (!process.env.FE_DOMAIN) errorsMessages.push("environment variable name=FE_DOMAIN not specified");
  if (!process.env.FE_SSL) errorsMessages.push("environment variable name=FE_SSL not specified");
  if (!process.env.FE_CORS_ORIGIN) errorsMessages.push("environment variable name=FE_CORS_ORIGIN not specified");
  /** ENV FOR CONNECT WITH MAIL*/
  if (!process.env.MAIL_HOST) errorsMessages.push("environment variable name=MAIL_HOST not specified");
  if (!process.env.MAIL_PORT) errorsMessages.push("environment variable name=MAIL_PORT not specified");
  if (!process.env.MAIL_USER) errorsMessages.push("environment variable name=MAIL_USER not specified");
  if (!process.env.MAIL_PWD) errorsMessages.push("environment variable name=MAIL_PWD not specified");
  if (errorsMessages.length > 0) {
    throw new Error(errorsMessages.join("\n"));
  }
};
checkEnvironment();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: CONFIG.corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ApiTransformInterceptor());
  app.use(cookieParser());

  await app.listen(3002);
}

bootstrap();
