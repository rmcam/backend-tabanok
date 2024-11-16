import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  ); 
  const config = new DocumentBuilder()
    .setTitle('Tabanok')
    .setDescription('The Tabanok API description')  
    .setVersion('1.0')
    .addTag('Tabanok')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  app.setGlobalPrefix('api'),
  await app.listen(3000);
}
bootstrap();
