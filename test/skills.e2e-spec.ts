import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Reflector } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AllExceptionFilter } from 'src/common/filters/all-exception.filter';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

type CategoryResponse = {
  id: string;
  name: string;
};

type SkillResponse = {
  id: string;
  title: string;
  description: string;
  images: string[];
};

type SkillsListResponse = {
  data: SkillResponse[];
  page: number;
  totalPages: number;
};

describe('SkillsController (e2e)', () => {
  let app: INestApplication<App>;
  let adminAccessToken: string;
  let userAccessToken: string;
  let categoryId: string;
  let skillId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      })
      .expect(200);

    const adminTokens = adminLoginResponse.body as AuthResponse;
    adminAccessToken = adminTokens.accessToken;

    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'Alice1234!',
      })
      .expect(200);

    const userTokens = userLoginResponse.body as AuthResponse;
    userAccessToken = userTokens.accessToken;

    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: `E2E Skills Category ${Date.now()}`,
      })
      .expect(201);

    const category = categoryResponse.body as CategoryResponse;
    categoryId = category.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a skill', async () => {
    const response = await request(app.getHttpServer())
      .post('/skills')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'E2E Guitar Basics',
        description: 'Learn basic guitar chords',
        categoryId,
        images: ['guitar-e2e.png'],
      })
      .expect(201);

    const skill = response.body as SkillResponse;

    expect(skill.id).toEqual(expect.any(String));
    expect(skill.title).toBe('E2E Guitar Basics');
    expect(skill.description).toBe('Learn basic guitar chords');
    expect(skill.images).toEqual(['guitar-e2e.png']);

    skillId = skill.id;
  });

  it('returns skills list', async () => {
    const response = await request(app.getHttpServer())
      .get('/skills')
      .query({
        search: 'Guitar',
        page: 1,
        limit: 10,
      })
      .expect(200);

    const body = response.body as SkillsListResponse;

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.page).toBe(1);
    expect(body.totalPages).toEqual(expect.any(Number));
    expect(body.data.some((skill) => skill.id === skillId)).toBe(true);
  });

  it('updates own skill', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/skills/${skillId}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'E2E Guitar Advanced',
        description: 'Learn advanced guitar chords',
      })
      .expect(200);

    const skill = response.body as SkillResponse;

    expect(skill.id).toBe(skillId);
    expect(skill.title).toBe('E2E Guitar Advanced');
    expect(skill.description).toBe('Learn advanced guitar chords');
  });

  it('adds skill to favorites', async () => {
    await request(app.getHttpServer())
      .post(`/skills/${skillId}/favorite`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(204);
  });

  it('does not add same skill to favorites twice', async () => {
    await request(app.getHttpServer())
      .post(`/skills/${skillId}/favorite`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(409);
  });

  it('removes skill from favorites', async () => {
    await request(app.getHttpServer())
      .delete(`/skills/${skillId}/favorite`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(204);
  });

  it('deletes own skill', async () => {
    await request(app.getHttpServer())
      .delete(`/skills/${skillId}`)
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);
  });
});
