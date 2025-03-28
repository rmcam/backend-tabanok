import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 8000,
    host: process.env.HOST || '0.0.0.0',
    apiPrefix: process.env.API_PREFIX || 'api/v1',

    // Configuración de seguridad
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

    // Configuración de base de datos
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME || 'tabanok',
        ssl: process.env.DB_SSL === 'true',
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 100,
        slaves: process.env.DB_SLAVES ? JSON.parse(process.env.DB_SLAVES) : [],
    },

    // Configuración de Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || '',
        ttl: parseInt(process.env.REDIS_CACHE_TTL, 10) || 60,
    },

    // Configuración de logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json',
    },

    // Configuración de email
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || 'no-reply@tabanok.com',
    },

    // Configuración de almacenamiento
    storage: {
        provider: process.env.STORAGE_PROVIDER || 'local',
        bucket: process.env.STORAGE_BUCKET || 'uploads',
        region: process.env.STORAGE_REGION || 'us-east-1',
        accessKey: process.env.STORAGE_ACCESS_KEY,
        secretKey: process.env.STORAGE_SECRET_KEY,
    },

    // Configuración de servicios externos
    services: {
        translationApi: process.env.TRANSLATION_API_URL,
        translationApiKey: process.env.TRANSLATION_API_KEY,
        analyticsApi: process.env.ANALYTICS_API_URL,
        analyticsApiKey: process.env.ANALYTICS_API_KEY,
    },
})); 