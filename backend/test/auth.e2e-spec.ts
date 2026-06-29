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
import { AuthRefreshRequest, TAuthTokens } from '../src/auth/auth.types';
import { LoginDto } from '../src/auth/dto/login.dto';
import { RegisterDto } from '../src/auth/dto/register.dto';
import { AllExceptionFilter } from '../src/common/filters/all-exception.filter';
import { AppDataSource } from '../src/config/database.config';
import { seedUsers } from '../src/scripts/seed-users';
import { seedAdmin } from '../src/scripts/seed-admin';
import { USERS_DATA } from '../src/scripts/data/users.data';
import { User } from '../src/users/entities/user.entity';
import { Gender, Role } from '../src/users/entities/user.enums';

describe('Categories (e2e)', () => {
  let app: INestApplication<App>;

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
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.synchronize(true);
      await seedUsers();
      await seedAdmin();
    }
  });

  afterEach(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    await app.close();
    jest.restoreAllMocks();
  });

  describe('/api/auth/register (POST)', () => {
    const registerRequest: RegisterDto = {
      name: 'Тестовый пользователь',
      email: 'test.user@example.com',
      password: 'TestPassword1234',
      about: 'Тестовое описание',
      birthdate: new Date('2000-06-20'),
      city: 'Москва',
      gender: Gender.MALE,
      avatar: 'link',
      skills: [],
      wantToLearn: [],
      favoriteSkills: [],
    };

    it('should register new user successfully', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerRequest)
        .expect(201);
      const tokens: TAuthTokens = response.body as TAuthTokens;

      expect(tokens).toBeDefined();
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    it('should fail with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerRequest)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerRequest)
        .expect(409);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with correct credentials', async () => {
      const testUser = USERS_DATA[0];
      const loginRequest: LoginDto = {
        email: testUser.email,
        password: testUser.password,
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginRequest)
        .expect(200);
      const tokens: TAuthTokens = response.body as TAuthTokens;

      expect(tokens).toBeDefined();
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    it('should fail for unregistered data', async () => {
      const invalidLoginRequest: LoginDto = {
        email: 'unknown@example.com',
        password: 'unknownPassword1234',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(invalidLoginRequest)
        .expect(401);
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    it('should refresh for authorized user', async () => {
      const testUser = USERS_DATA[0];
      const loginRequest: LoginDto = {
        email: testUser.email,
        password: testUser.password,
      };
      const userRepository = AppDataSource.getRepository(User);
      const databaseUserData = (await userRepository.findOne({
        where: { email: testUser.email },
      })) as User;

      const loginTime = Date.now();
      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(loginTime);

      const loginResponse: request.Response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginRequest)
        .expect(200);
      const tokens: TAuthTokens = loginResponse.body as TAuthTokens;

      const refreshRequest: Partial<AuthRefreshRequest> = {
        refreshToken: tokens.refreshToken,
        user: {
          sub: databaseUserData.id,
          email: testUser.email,
          role: testUser.role,
        },
      };

      dateSpy.mockReturnValue(loginTime + 5000);

      const response: request.Response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send(refreshRequest)
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .expect(200);
      const refreshedTokens: TAuthTokens = response.body as TAuthTokens;

      dateSpy.mockRestore();

      expect(refreshedTokens).toBeDefined();
      expect(refreshedTokens).toHaveProperty('accessToken');
      expect(refreshedTokens).toHaveProperty('refreshToken');
      expect(tokens.accessToken).not.toEqual(refreshedTokens.accessToken);
      expect(tokens.refreshToken).not.toEqual(refreshedTokens.refreshToken);
    });

    it('should fail for unregistered data', async () => {
      const refreshRequest: Partial<AuthRefreshRequest> = {
        refreshToken: 'fake-refresh-token',
        user: {
          sub: 'fake-user-id',
          email: 'fake-email',
          role: Role.USER,
        },
      };

      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send(refreshRequest)
        .set('Authorization', `Bearer ${refreshRequest.refreshToken}`)
        .expect(401);
    });
  });
});
