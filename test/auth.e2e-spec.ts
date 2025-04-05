import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { CreateUserTable1709853742000 } from '../src/migrations/1709853742000-CreateUserTable';
import { clearDatabase, closeTestingModule, createTestingModule, initializeTestApp } from './test-utils';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let moduleFixture;

    beforeAll(async () => {
        try {
            moduleFixture = await createTestingModule();
            app = await initializeTestApp(moduleFixture);
            dataSource = moduleFixture.get(DataSource);

            if (!dataSource.isInitialized) {
                await dataSource.initialize();
            }

            // Verificar que la tabla users existe
            const tableExists = await dataSource.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                );
            `);

            if (!tableExists[0].exists) {
                console.error('La tabla users no existe. Ejecutando migraciones...');
                // Ejecutar migraciones si la tabla no existe
                const migration = new CreateUserTable1709853742000();
                await migration.up(dataSource.createQueryRunner());
            }
        } catch (error) {
            console.error('Error in beforeAll:', error);
            throw error;
        }
    });

    beforeEach(async () => {
        try {
            await clearDatabase(dataSource);
        } catch (error) {
            console.error('Error in beforeEach:', error);
            throw error;
        }
    });

    afterAll(async () => {
        try {
            await closeTestingModule();
        } catch (error) {
            console.error('Error in afterAll:', error);
        }
    });

    describe('POST /api/v1/auth/login', () => {
        it('should validate required fields', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({})
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toBeInstanceOf(Array);
                    expect(res.body.message).toContain('email must be an email');
                    expect(res.body.message).toContain('password should not be empty');
                });
        });

        it('should validate email format', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('email must be an email');
                });
        });
    });

    describe('POST /api/v1/auth/register', () => {
        it('should validate required fields', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({})
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toBeInstanceOf(Array);
                    expect(res.body.message).toContain('username should not be empty');
                    expect(res.body.message).toContain('profile must be an object');
                    expect(res.body.message).toContain('email must be an email');
                    expect(res.body.message).toContain('password should not be empty');
                });
        });

        it('should validate email format', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    username: 'juan.perez',
                    profile: {
                        firstName: 'Juan',
                        lastName: 'Pérez'
                    },
                    email: 'invalid-email',
                    password: 'password123'
                })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('email must be an email');
                });
        });

        it('should validate password length', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    username: 'juan.perez',
                    profile: {
                        firstName: 'Juan',
                        lastName: 'Pérez'
                    },
                    email: 'test@example.com',
                    password: 'short'
                })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('password must be longer than or equal to 8 characters');
                });
        });

        it('should successfully register a new user', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    username: 'juanperez',
                    email: 'test@example.com',
                    password: 'password123',
                    profile: {
                        firstName: 'Juan',
                        lastName: 'Perez'
                    }
                })
                .expect(201);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email', 'test@example.com');
            expect(response.body.user).toHaveProperty('username', 'juanperez');
            expect(response.body.user).toHaveProperty('profile');
            expect(response.body.user.profile).toHaveProperty('firstName', 'Juan');
            expect(response.body.user.profile).toHaveProperty('lastName', 'Perez');
            expect(response.body.user).toHaveProperty('role', 'user');
        });
    });
}); 