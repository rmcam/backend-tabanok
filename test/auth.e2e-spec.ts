import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
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
                    expect(res.body.message).toContain('El correo electrónico debe ser válido.');
                    expect(res.body.message).toContain('La contraseña debe tener al menos 8 caracteres, un número, una letra mayúscula, una letra minúscula y un carácter especial.');
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
                    expect(res.body.message).toContain('El correo electrónico debe ser válido.');
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
                    expect(res.body.message).toContain('El nombre no debe estar vacío.'); // Changed
                    expect(res.body.message).toContain('El apellido no debe estar vacío.'); // Changed
                    expect(res.body.message).toContain('El correo electrónico debe ser válido.');
                    expect(res.body.message).toContain('La contraseña debe tener al menos 8 caracteres, un número, una letra mayúscula, una letra minúscula y un carácter especial.');
                });
        });

        it('should validate email format', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    // Corrected payload: removed username and profile, added firstName/lastName directly
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    email: 'invalid-email',
                    password: 'Password123!' // Use a valid password format here to isolate email validation
                })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('El correo electrónico debe ser válido.');
                });
        });

        it('should validate password complexity', () => { // Renamed test for clarity
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    // Corrected payload
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    email: `test_${Date.now()}@example.com`, // Use unique email
                    password: 'short' // Invalid password
                })
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toContain('La contraseña debe tener al menos 8 caracteres, un número, una letra mayúscula, una letra minúscula y un carácter especial.');
                });
        });

        it('should successfully register a new user', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    firstName: 'Juan',
                    lastName: 'Perez',
                    email: `test_${Date.now()}@example.com`,
                    password: 'Password123!',
                    languages: ['es', 'kam']
                })
                .expect(201);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email');
            expect(response.body.user).toHaveProperty('firstName', 'Juan');
            expect(response.body.user).toHaveProperty('lastName', 'Perez');
            expect(response.body.user).toHaveProperty('role', 'user');
        });

        it('should fail to register with an existing email', async () => {
            const uniqueEmail = `existing_${Date.now()}@example.com`;
            // First, register a user
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    firstName: 'Existing',
                    lastName: 'User',
                    email: uniqueEmail,
                    password: 'Password123!',
                    languages: ['es']
                })
                .expect(201);

            // Then, attempt to register again with the same email
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    firstName: 'Another',
                    lastName: 'User',
                    email: uniqueEmail,
                    password: 'Password456!',
                    languages: ['kam']
                })
                .expect(409) // Expect Conflict status
                .expect(res => {
                    expect(res.body.message).toContain('El correo electrónico ya está registrado.'); // Adjust message as needed
                });
        });
    });

    // --- Added Login Tests ---
    describe('POST /api/v1/auth/login (Success and Failure Cases)', () => {
        const testEmail = `login_test_${Date.now()}@example.com`;
        const testPassword = 'Password123!';

        beforeAll(async () => {
            // Register a user specifically for login tests
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    firstName: 'Login',
                    lastName: 'TestUser',
                    email: testEmail,
                    password: testPassword,
                    languages: ['es']
                })
                .expect(201);
        });

        it('should successfully log in a registered user', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: testPassword
                })
                .expect(200) // Or 201 depending on your login response status
                .expect(res => {
                    expect(res.body).toHaveProperty('accessToken');
                    expect(res.body).toHaveProperty('refreshToken');
                    expect(res.body).toHaveProperty('user');
                    expect(res.body.user.email).toEqual(testEmail);
                });
        });

        it('should fail to log in with incorrect password', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: 'WrongPassword!'
                })
                .expect(401) // Expect Unauthorized status
                .expect(res => {
                    // Adjust the expected message based on your actual error response
                    expect(res.body.message).toContain('Credenciales inválidas');
                });
        });

        it('should fail to log in with non-existent email', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testPassword
                })
                .expect(401) // Expect Unauthorized status
                .expect(res => {
                    // Adjust the expected message based on your actual error response
                    expect(res.body.message).toContain('Credenciales inválidas');
                });
        });
    });
    // --- End Added Login Tests ---
});
