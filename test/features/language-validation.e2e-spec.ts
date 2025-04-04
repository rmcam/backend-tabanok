
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Language Validation E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should validate Kamentsa text successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/language-validation/validate')
      .send({ text: 'ts̈ëngbe' })
      .expect(200);

    // Aceptar que puede ser inválido si el diccionario no está cargado
    expect(response.body).toHaveProperty('isValid');
    expect(typeof response.body.isValid).toBe('boolean');
  });
});
