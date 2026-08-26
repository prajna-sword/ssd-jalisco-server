import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This line turns on automatic validation for every single DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically strips out any fields not defined in the DTO
    transform: true, // Automatically changes types to match the DTO targets
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
