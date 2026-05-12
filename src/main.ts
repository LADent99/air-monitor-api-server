import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters/http-exception.filter";

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  return app;
}

async function bootstrap() {
  const app = await createApp();
  await app.listen(parseInt(process.env.PORT ?? "3000", 10));
}

if (require.main === module) {
  bootstrap();
}
