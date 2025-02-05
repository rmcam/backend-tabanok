import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  // app.useGlobalFilters(new AllExceptionsFilter());
  // main.ts
  
  app.enableCors({
    origin: process.env.NEXTAUTH_URL, 
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove all fields that are not in the DTO
      forbidNonWhitelisted: true, // throw an error if a field is not in the DTO
      transform: true, // transform the DTO to the entity
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Tabanok')
    .setDescription('The Tabanok API description')
    .setVersion('1.0')
    .addTag('Tabanok')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);
  await app.listen(parseInt(process.env.PORT) || 8000);
}
bootstrap();
