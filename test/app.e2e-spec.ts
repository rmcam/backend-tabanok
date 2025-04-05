import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { clearDatabase, closeTestingModule, createTestingModule, initializeTestApp } from './test-utils';

describe('AppController (e2e)', () => {
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

    it('/api/v1 (GET)', () => {
        return request(app.getHttpServer())
            .get('/api/v1')
            .expect(200)
            .expect('Hello World!');
    });

    it('/api/v1/docs (GET)', () => {
        return request(app.getHttpServer())
            .get('/api/v1/docs')
            .expect(200);
    });
}); 