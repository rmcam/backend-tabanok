import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { CreateTables1709853742000 } from '../src/migrations/1709853742000-CreateTables';
import { CreateUserTable1709853742000 } from '../src/migrations/1709853742000-CreateUserTable';
import { CreateAccountTable1709853742001 } from '../src/migrations/1709853742001-CreateAccountTable';
import { UpdateActivityDescription1709853742001 } from '../src/migrations/1709853742001-UpdateActivityDescription';
import { CreateVocabularyTable1709853742003 } from '../src/migrations/1709853742003-CreateVocabularyTable';
import { FixActivityTypes1709854000000 } from '../src/migrations/1709854000000-FixActivityTypes';
import { CreateCulturalContent1711558800000 } from '../src/migrations/1711558800000-CreateCulturalContent';
import { CreateEvaluationTable1711558800000 } from '../src/migrations/1711558800000-CreateEvaluationTable';
import { UpdateCulturalContent1711558800001 } from '../src/migrations/1711558800001-UpdateCulturalContent';
import { AddCategoryColumn1711558900000 } from '../src/migrations/1711558900000-AddCategoryColumn';
import { UpdateCulturalContentCategory1711558900000 } from '../src/migrations/1711558900000-UpdateCulturalContentCategory';
import { AddContentColumn1711558900002 } from '../src/migrations/1711558900002-AddContentColumn';
import { AddContentAndCategoryColumns1711559000000 } from '../src/migrations/1711559000000-AddContentAndCategoryColumns';
import { CreateGamificationTables1711559100000 } from '../src/migrations/1711559100000-CreateGamificationTables';
import { CreateStatisticsTable1711559200000 } from '../src/migrations/1711559200000-CreateStatisticsTable';
import { UpdateStatisticsWithCategories1711559300000 } from '../src/migrations/1711559300000-UpdateStatisticsWithCategories';
import { CreateTagsTable1711559400000 } from '../src/migrations/1711559400000-CreateTagsTable';
import { UpdateUserNameFields1711642800000 } from '../src/migrations/1711642800000-UpdateUserNameFields';

const migrations = [
    CreateUserTable1709853742000,
    CreateAccountTable1709853742001,
    CreateTables1709853742000,
    CreateVocabularyTable1709853742003,
    FixActivityTypes1709854000000,
    UpdateActivityDescription1709853742001,
    CreateCulturalContent1711558800000,
    AddCategoryColumn1711558900000,
    UpdateCulturalContentCategory1711558900000,
    AddContentColumn1711558900002,
    AddContentAndCategoryColumns1711559000000,
    UpdateCulturalContent1711558800001,
    CreateEvaluationTable1711558800000,
    CreateGamificationTables1711559100000,
    CreateStatisticsTable1711559200000,
    UpdateStatisticsWithCategories1711559300000,
    CreateTagsTable1711559400000,
    UpdateUserNameFields1711642800000,
];

// Desactivar nest-commander durante las pruebas
process.env.DISABLE_NEST_COMMANDER = 'true';
process.env.NODE_ENV = 'test';

let app: INestApplication;
let moduleFixture: TestingModule;
let dataSource: DataSource;

async function createTestDatabase() {
    // Crear una conexión temporal a la base de datos postgres
    const tempDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: 'postgres', // Conectar a la base de datos por defecto
    });

    try {
        await tempDataSource.initialize();

        // Intentar eliminar la base de datos de prueba si existe
        await tempDataSource.query(`
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = 'tabanok_test'
            AND pid <> pg_backend_pid();
        `).catch(() => { });

        // Esperar un momento para asegurarse de que todas las conexiones se han cerrado
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Intentar eliminar la base de datos con FORCE
        await tempDataSource.query(`DROP DATABASE IF EXISTS tabanok_test WITH (FORCE);`).catch(() => { });

        // Esperar otro momento antes de crear la base de datos
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Intentar crear la base de datos
        try {
            await tempDataSource.query(`CREATE DATABASE tabanok_test;`);
        } catch (error) {
            if (error.code === '23505') { // Si la base de datos ya existe
                console.log('La base de datos ya existe, continuando...');
            } else {
                throw error;
            }
        }

        // Conectar a la base de datos de prueba para crear las extensiones
        await tempDataSource.destroy();
        const testDataSource = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: 'tabanok_test',
        });

        await testDataSource.initialize();
        await testDataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await testDataSource.query(`CREATE EXTENSION IF NOT EXISTS "plpgsql";`);

        // Ejecutar las migraciones
        console.log('Ejecutando migraciones...');
        const queryRunner = testDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const migration of migrations) {
                console.log(`Ejecutando migración: ${migration.name}`);
                const instance = new migration();
                await instance.up(queryRunner);
            }
            await queryRunner.commitTransaction();
            console.log('Migraciones completadas exitosamente');
        } catch (error) {
            console.error('Error ejecutando migraciones:', error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
            await testDataSource.destroy();
        }
    } catch (error) {
        console.error('Error creating test database:', error);
        throw error;
    } finally {
        if (tempDataSource.isInitialized) {
            await tempDataSource.destroy();
        }
    }
}

export async function createTestingModule(): Promise<TestingModule> {
    if (!moduleFixture) {
        moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(ConfigService)
            .useValue({
                get: (key: string) => {
                    switch (key) {
                        case 'DB_HOST':
                            return process.env.DB_HOST || 'localhost';
                        case 'DB_PORT':
                            return parseInt(process.env.DB_PORT || '5432', 10);
                        case 'DB_USER':
                            return process.env.DB_USER || 'postgres';
                        case 'DB_PASSWORD':
                            return process.env.DB_PASSWORD || 'postgres';
                        case 'DB_NAME':
                            return 'tabanok_test';
                        case 'DB_SSL':
                            return process.env.DB_SSL === 'true';
                        case 'JWT_SECRET':
                            return process.env.JWT_SECRET || 'test_secret_key';
                        case 'PORT':
                            return parseInt(process.env.PORT || '3001', 10);
                        default:
                            return process.env[key];
                    }
                },
            })
            // Excluir los módulos de comandos durante las pruebas
            .overrideProvider('COMMANDS')
            .useValue([])
            .compile();
    }
    return moduleFixture;
}

export async function initializeTestApp(module: TestingModule): Promise<INestApplication> {
    if (!app) {
        app = module.createNestApplication();

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            validateCustomDecorators: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true
        }));

        const config = new DocumentBuilder()
            .setTitle('API Documentation')
            .setDescription('API documentation for the application')
            .setVersion('1.0')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/v1/docs', app, document);

        await app.init();
    }
    return app;
}

export async function clearDatabase(ds: DataSource): Promise<void> {
    try {
        if (!ds.isInitialized) {
            await ds.initialize();
        }

        // Desactivar restricciones de clave foránea temporalmente
        await ds.query('SET session_replication_role = replica;');

        // Obtener todas las tablas excepto migrations
        const tables = await ds.query(`
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename != 'migrations'
            ORDER BY tablename DESC;
        `);

        // Truncar cada tabla
        for (const { tablename } of tables) {
            try {
                await ds.query(`TRUNCATE TABLE "${tablename}" CASCADE;`);
            } catch (error) {
                console.error(`Error truncating table ${tablename}:`, error);
            }
        }

        // Reactivar restricciones de clave foránea
        await ds.query('SET session_replication_role = DEFAULT;');
    } catch (error) {
        console.error('Error in clearDatabase:', error);
        throw error;
    }
}

export async function closeTestingModule(): Promise<void> {
    try {
        if (app) {
            await app.close();
            app = null;
        }
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
            dataSource = null;
        }
        if (moduleFixture) {
            await moduleFixture.close();
            moduleFixture = null;
        }
    } catch (error) {
        console.error('Error in closeTestingModule:', error);
    }
} 