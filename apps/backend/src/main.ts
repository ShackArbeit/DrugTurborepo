import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.enableCors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });
  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port); 
}
bootstrap();
