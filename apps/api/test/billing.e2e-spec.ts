import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Billing (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/billing/subscription (GET) - Unauthorized', () => {
    return request(app.getHttpServer())
      .get('/billing/subscription')
      .expect(401);
  });

  it('GraphQL: billingPlans - Unauthorized', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: '{ billingPlans { id name slug } }',
      })
      .expect(200) // GraphQL returns 200 with errors in body
      .expect((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toContain('Unauthorized');
      });
  });
});
