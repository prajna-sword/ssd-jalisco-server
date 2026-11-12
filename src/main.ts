import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This line turns on automatic validation for every single DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist: false, // TODO: Automatically strips out any fields not defined in the DTO
    transform: true, // Automatically changes types to match the DTO targets
  }));

  // Enable CORS for local development
  app.enableCors({
    origin: 'http://localhost:4200', // Your Angular app address
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
