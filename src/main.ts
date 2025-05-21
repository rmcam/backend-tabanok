import * as crypto from 'crypto';
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression from "compression";
import cookieParser from "cookie-parser"; // Importar cookie-parser
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid"; // Importar uuidv4
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { CustomValidationPipe } from "./common/pipes/custom-validation.pipe";


async function bootstrap() {
  // Crear la aplicación con opciones de seguridad
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
  });

  const configService = app.get(ConfigService); // Mover la declaración aquí
  const allowedOrigins = configService
    .get<string>("ALLOWED_ORIGINS")
    .split(",");
// Polyfill para crypto.randomUUID si no está definido (problema en algunos entornos Node.js)
  if (typeof global.crypto === 'undefined' || typeof global.crypto.randomUUID !== 'function') {
    if (typeof global.crypto === 'undefined') {
      global.crypto = {} as any; // Asegurar que global.crypto exista como objeto vacío
    }
    // @ts-expect-error: uuidv4 devuelve string, pero global.crypto.randomUUID espera un tipo literal de plantilla.
    // Suprimimos el error ya que uuidv4 genera UUIDs válidos.
    global.crypto.randomUUID = uuidv4;
  }
  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  });

  
  app.use(cookieParser()); // Usar el middleware cookie-parser

  const logger = new Logger("Bootstrap");

  // Configurar middleware de seguridad
  app.use(helmet() as any);
  app.use(compression());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: configService.get("RATE_LIMIT_MAX", 100), // límite por IP
    }) as any
  );

  // app.use(favicon(join(__dirname, '..', 'favicon.ico')));

  // Configurar validación global
  app.useGlobalPipes(
    new CustomValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Aplicar guardia JWT globalmente
  // Configurar prefijo global para la API
  // app.setGlobalPrefix('api/v1');

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle("Tabanok API")
    .setDescription(
      "API para la plataforma de aprendizaje Tabanok - Lengua Kamentsa"
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth", "Autenticación y autorización")
    .addTag("users", "Gestión de usuarios")
    .addTag("learning-content", "Gestión de contenido educativo")
    .addTag("learning-lessons", "Gestión de lecciones")
    .addTag("learning-activities", "Gestión de actividades")
    .addTag("user-notifications", "Gestión de notificaciones")
    .build();
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  // Configurar puerto y host
  const port = process.env.PORT || 10000; // Puerto por defecto para local y Docker
  const host = "0.0.0.0"; // Render requiere enlazar en 0.0.0.0

  // Ejecutar migraciones automáticas
  try {
    const dataSource = app.get(require("typeorm").DataSource);
    await dataSource.runMigrations();
    console.log("Migraciones aplicadas correctamente");
  } catch (error) {
    console.error("Error aplicando migraciones:", error);
  }

  // Iniciar la aplicación
  await app.listen(port, host);
  if(process.env.NODE_ENV=='production'){
    logger.log(`Backend running: https://${host}:${port}/docs`);
  }else if(process.env.NODE_ENV=='development'){
    logger.log(`Backend running: http://127.0.0.1:${port}/docs`);
  }
  

  // Manejar señales de terminación
  process.on("SIGTERM", async () => {
    logger.log("SIGTERM received. Closing application gracefully...");
    await app.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    logger.log("SIGINT received. Closing application gracefully...");
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error("Error during bootstrap:", err);
  process.exit(1);
});
