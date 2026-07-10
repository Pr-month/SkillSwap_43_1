import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Reflector } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AllExceptionFilter } from '../src/common/filters/all-exception.filter';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../src/categories/entities/category.entity';
import { Gender } from '../src/users/entities/user.enums';

describe('Requests (e2e)', () => {
  let app: INestApplication<App>;
  let categoryRepo: Repository<Category>;

  const testEmail1 = `e2e-alice-${Date.now()}@test.local`;
  const testEmail2 = `e2e-bob-${Date.now()}@test.local`;
  const password = 'Password123!';

  let aliceToken: string;
  let bobToken: string;
  let aliceSkillId: string;
  let bobSkillId: string;
  let requestId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionFilter());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.init();

    categoryRepo = app.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Setup: seed categories + register users + create skills', () => {
    let category1Id: string;
    let category2Id: string;

    it('should seed categories via repository', async () => {
      const cat1 = categoryRepo.create({ name: `TestCat-IT-${Date.now()}` });
      const saved1 = await categoryRepo.save(cat1);
      category1Id = saved1.id;

      const cat2 = categoryRepo.create({ name: `TestCat-Music-${Date.now()}` });
      const saved2 = await categoryRepo.save(cat2);
      category2Id = saved2.id;

      expect(category1Id).toBeDefined();
      expect(category2Id).toBeDefined();
    });

    it('should register Alice', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Alice',
          email: testEmail1,
          password,
          about: 'Test user Alice',
          birthdate: '2000-01-01T00:00:00.000Z',
          city: 'Moscow',
          gender: Gender.FEMALE,
          avatar: '/uploads/default-avatar.png',
          skills: [],
          wantToLearn: [],
          favoriteSkills: [],
        })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      aliceToken = res.body.accessToken;
    });

    it('should register Bob', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Bob',
          email: testEmail2,
          password,
          about: 'Test user Bob',
          birthdate: '1998-05-15T00:00:00.000Z',
          city: 'Moscow',
          gender: Gender.MALE,
          avatar: '/uploads/default-avatar.png',
          skills: [],
          wantToLearn: [],
          favoriteSkills: [],
        })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      bobToken = res.body.accessToken;
    });

    it('should create Alices skill (TypeScript)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/skills')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'TypeScript',
          description: 'TypeScript expert',
          categoryId: category1Id,
          images: ['/uploads/ts.png'],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      aliceSkillId = res.body.id;
    });

    it('should create Bobs skill (Python)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/skills')
        .set('Authorization', `Bearer ${bobToken}`)
        .send({
          title: 'Python',
          description: 'Python expert',
          categoryId: category2Id,
          images: ['/uploads/py.png'],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      bobSkillId = res.body.id;
    });
  });

  describe('POST /api/requests — create request', () => {
    it('should create a request (Alice offers her skill for Bobs skill)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/requests')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          offeredSkill: aliceSkillId,
          requestedSkill: bobSkillId,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('pending');
      requestId = res.body.id;
    });

    it('should reject without auth (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/requests')
        .send({ offeredSkill: aliceSkillId, requestedSkill: bobSkillId })
        .expect(401);
    });

    it('should reject with invalid UUID (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/requests')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ offeredSkill: 'not-a-uuid', requestedSkill: bobSkillId })
        .expect(400);
    });

    it('should reject offering someone elses skill (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/requests')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ offeredSkill: bobSkillId, requestedSkill: aliceSkillId })
        .expect(400);
    });
  });

  describe('GET /api/requests/incoming — incoming requests', () => {
    it('should return Alices request as incoming for Bob (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/requests/incoming')
        .set('Authorization', `Bearer ${bobToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((r: any) => r.id === requestId)).toBe(true);
    });

    it('should reject without auth (401)', async () => {
      await request(app.getHttpServer())
        .get('/api/requests/incoming')
        .expect(401);
    });
  });

  describe('GET /api/requests/outgoing — outgoing requests', () => {
    it('should return Alices request as outgoing for Alice (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/requests/outgoing')
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((r: any) => r.id === requestId)).toBe(true);
    });

    it('should reject without auth (401)', async () => {
      await request(app.getHttpServer())
        .get('/api/requests/outgoing')
        .expect(401);
    });
  });

  describe('PATCH /api/requests/:id — change status', () => {
    it('should accept the request by Bob (receiver) (200)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/requests/${requestId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ status: 'accepted' })
        .expect(200);

      expect(res.body.id).toBe(requestId);
      expect(res.body.status).toBe('accepted');
    });

    it('should reject status change by Alice (sender, not receiver) (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/requests/${requestId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ status: 'rejected' })
        .expect(403);
    });

    it('should reject without auth (401)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/requests/${requestId}`)
        .send({ status: 'accepted' })
        .expect(401);
    });

    it('should reject invalid status value (400)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/requests/${requestId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ status: 'invalid-status' })
        .expect(400);
    });

    it('should return 404 for non-existent request', async () => {
      await request(app.getHttpServer())
        .patch('/api/requests/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ status: 'accepted' })
        .expect(404);
    });
  });

  describe('DELETE /api/requests/:id — delete request', () => {
    let deleteRequestId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/requests')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ offeredSkill: aliceSkillId, requestedSkill: bobSkillId })
        .expect(201);

      deleteRequestId = res.body.id;
    });

    it('should delete by sender (204)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/requests/${deleteRequestId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(204);
    });

    it('should return 404 for deleted request', async () => {
      await request(app.getHttpServer())
        .delete(`/api/requests/${deleteRequestId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(404);
    });

    it('should reject delete by non-sender (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/requests')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ offeredSkill: aliceSkillId, requestedSkill: bobSkillId })
        .expect(201);

      const freshId = res.body.id;

      await request(app.getHttpServer())
        .delete(`/api/requests/${freshId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .expect(403);
    });

    it('should reject without auth (401)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/requests/${deleteRequestId}`)
        .expect(401);
    });
  });
});
