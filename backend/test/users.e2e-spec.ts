import { Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { TAuthTokens } from '../src/auth/auth.types';
import { LoginDto } from '../src/auth/dto/login.dto';
import { RegisterDto } from '../src/auth/dto/register.dto';
import { AllExceptionFilter } from '../src/common/filters/all-exception.filter';
import { Gender } from '../src/users/entities/user.enums';
import { User } from '../src/users/entities/user.entity';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;

  const buildRegisterRequest = (email: string): RegisterDto => ({
    name: 'Тестовый пользователь',
    email,
    password: 'TestPassword1234',
    about: 'Тестовое описание',
    birthdate: new Date('2000-06-20'),
    city: 'Москва',
    gender: Gender.MALE,
    avatar: 'link',
    skills: [],
    wantToLearn: [],
    favoriteSkills: [],
  });

  const registerAndLogin = async (
    email: string,
  ): Promise<{ accessToken: string; registerRequest: RegisterDto }> => {
    const registerRequest = buildRegisterRequest(email);
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerRequest)
      .expect(201);

    const loginRequest: LoginDto = {
      email: registerRequest.email,
      password: registerRequest.password,
    };
    const response: request.Response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginRequest)
      .expect(200);
    const tokens: TAuthTokens = response.body as TAuthTokens;

    return { accessToken: tokens.accessToken, registerRequest };
  };

  beforeEach(async () => {
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
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/users (GET)', () => {
    it('should return the list of users without sensitive fields', async () => {
      await registerAndLogin(`list-${Date.now()}@example.com`);

      const response: request.Response = await request(app.getHttpServer())
        .get('/api/users')
        .expect(200);
      const users: User[] = response.body as User[];

      expect(users.length).toBeGreaterThan(0);
      users.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('refreshToken');
      });
    });
  });

  describe('/api/users/me (GET)', () => {
    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
    });

    it('should return the current authenticated user', async () => {
      const email = `me-${Date.now()}@example.com`;
      const { accessToken } = await registerAndLogin(email);

      const response: request.Response = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const user: User = response.body as User;

      expect(user.email).toEqual(email);
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('refreshToken');
    });
  });

  describe('/api/users/me (PATCH)', () => {
    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .patch('/api/users/me')
        .send({ name: 'New Name' })
        .expect(401);
    });

    it('should update the profile of the current user', async () => {
      const email = `patch-${Date.now()}@example.com`;
      const { accessToken } = await registerAndLogin(email);

      await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Обновлённое имя', about: 'Обновлённое описание' })
        .expect(204);

      const response: request.Response = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const user: User = response.body as User;

      expect(user.name).toEqual('Обновлённое имя');
      expect(user.about).toEqual('Обновлённое описание');
    });
  });

  describe('/api/users/me/password (PATCH)', () => {
    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .patch('/api/users/me/password')
        .send({ currentPassword: 'old', newPassword: 'new' })
        .expect(401);
    });

    it('should return 401 when current password is incorrect', async () => {
      const email = `wrongpass-${Date.now()}@example.com`;
      const { accessToken } = await registerAndLogin(email);

      await request(app.getHttpServer())
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrong-password',
          newPassword: 'NewPassword1234',
        })
        .expect(401);
    });

    it('should update the password and allow login with the new password', async () => {
      const email = `changepass-${Date.now()}@example.com`;
      const { accessToken, registerRequest } = await registerAndLogin(email);
      const newPassword = 'NewPassword1234';

      await request(app.getHttpServer())
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: registerRequest.password,
          newPassword,
        })
        .expect(204);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: registerRequest.password })
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: newPassword })
        .expect(200);
    });
  });
});
