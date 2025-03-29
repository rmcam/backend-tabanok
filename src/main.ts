import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // Crear la aplicación con opciones de seguridad
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Configurar middleware de seguridad
  app.use(helmet() as any);
  app.use(compression());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: configService.get('RATE_LIMIT_MAX', 100), // límite por IP
    }) as any,
  );

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Tabanok API')
    .setDescription('API para la plataforma de aprendizaje Tabanok - Lengua Kamentsa')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('learning-content', 'Gestión de contenido educativo')
    .addTag('learning-lessons', 'Gestión de lecciones')
    .addTag('learning-activities', 'Gestión de actividades')
    .addTag('user-notifications', 'Gestión de notificaciones')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Configurar puerto y host
  const port = configService.get('PORT', 8000);
  const host = configService.get('HOST', '0.0.0.0');

  // Iniciar la aplicación
  await app.listen(port, host);
  logger.log(`Application is running on: http://${host}:${port}/api/v1/docs`);

  // Manejar señales de terminación
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received. Closing application gracefully...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received. Closing application gracefully...');
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch(err => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
