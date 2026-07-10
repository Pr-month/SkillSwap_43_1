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
import { AllExceptionFilter } from '../src/common/filters/all-exception.filter';
import { City } from '../src/cities/entities/city.entity';
import { CreateCityDto } from '../src/cities/dto/create-city.dto';
import { UpdateCityDto } from '../src/cities/dto/update-city.dto';
import { ADMIN_DATA, USERS_DATA } from '../src/scripts/data/users.data';

describe('Cities (e2e)', () => {
  let app: INestApplication<App>;

  const loginAsAdmin = async (): Promise<string> => {
    const loginRequest: LoginDto = {
      email: ADMIN_DATA.email,
      password: ADMIN_DATA.password,
    };
    const response: request.Response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginRequest);
    const tokens: TAuthTokens = response.body as TAuthTokens;
    return tokens.accessToken;
  };

  const loginAsUser = async (): Promise<string> => {
    const user = USERS_DATA[0];
    const loginRequest: LoginDto = {
      email: user.email,
      password: user.password,
    };
    const response: request.Response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginRequest);
    const tokens: TAuthTokens = response.body as TAuthTokens;
    return tokens.accessToken;
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

  describe('/api/cities (GET)', () => {
    it('should return a list of cities', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .get('/api/cities')
        .expect(200);
      const cities: City[] = response.body as City[];

      expect(cities).toBeInstanceOf(Array);
      expect(cities.length).toBeGreaterThan(0);
      cities.forEach((city) => {
        expect(city).toHaveProperty('id');
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('latitude');
        expect(city).toHaveProperty('longitude');
      });
    });

    it('should filter cities by name', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .get('/api/cities?name=Моск')
        .expect(200);
      const cities: City[] = response.body as City[];

      expect(cities.length).toBeGreaterThan(0);
      cities.forEach((city) => {
        expect(city.name.toLowerCase()).toContain('моск');
      });
    });

    it('should return at most 10 cities', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .get('/api/cities')
        .expect(200);
      const cities: City[] = response.body as City[];

      expect(cities.length).toBeLessThanOrEqual(10);
    });
  });

  describe('/api/cities (POST)', () => {
    const newCity: CreateCityDto = {
      name: 'Тестовый город',
      latitude: 55.0,
      longitude: 37.0,
      district: 'Тестовый округ',
      population: 100000,
      subject: 'Тестовый субъект',
    };

    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .post('/api/cities')
        .send(newCity)
        .expect(401);
    });

    it('should return 403 without admin role', async () => {
      const accessToken = await loginAsUser();

      await request(app.getHttpServer())
        .post('/api/cities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newCity)
        .expect(403);
    });

    it('should create a new city with admin role', async () => {
      const accessToken = await loginAsAdmin();

      const response: request.Response = await request(app.getHttpServer())
        .post('/api/cities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newCity)
        .expect(201);
      const created: City = response.body as City;

      expect(created).toHaveProperty('id');
      expect(created.name).toBe(newCity.name);
      expect(created.latitude).toBe(newCity.latitude);
      expect(created.longitude).toBe(newCity.longitude);
    });
  });

  describe('/api/cities/:id (PATCH)', () => {
    const updateDto: UpdateCityDto = {
      name: 'Обновлённый город',
      latitude: 56.0,
      longitude: 38.0,
      district: 'Обновлённый округ',
      population: 200000,
      subject: 'Обновлённый субъект',
    };

    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .patch('/api/cities/00000000-0000-0000-0000-000000000000')
        .send(updateDto)
        .expect(401);
    });

    it('should return 403 without admin role', async () => {
      const accessToken = await loginAsUser();

      await request(app.getHttpServer())
        .patch('/api/cities/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should update an existing city with admin role', async () => {
      const accessToken = await loginAsAdmin();

      const createResponse: request.Response = await request(
        app.getHttpServer(),
      )
        .post('/api/cities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Город до обновления',
          latitude: 55.0,
          longitude: 37.0,
          district: 'Округ',
          population: 100000,
          subject: 'Субъект',
        })
        .expect(201);
      const created: City = createResponse.body as City;

      const updateResponse: request.Response = await request(
        app.getHttpServer(),
      )
        .patch(`/api/cities/${created.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);
      const updated: City = updateResponse.body as City;

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe(updateDto.name);
    });

    it('should return 404 for a non-existent city', async () => {
      const accessToken = await loginAsAdmin();

      await request(app.getHttpServer())
        .patch('/api/cities/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/api/cities/:id (DELETE)', () => {
    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .delete('/api/cities/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });

    it('should return 403 without admin role', async () => {
      const accessToken = await loginAsUser();

      await request(app.getHttpServer())
        .delete('/api/cities/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should delete a city with admin role', async () => {
      const accessToken = await loginAsAdmin();

      const createResponse: request.Response = await request(
        app.getHttpServer(),
      )
        .post('/api/cities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Удаляемый город',
          latitude: 55.0,
          longitude: 37.0,
          district: 'Округ',
          population: 100000,
          subject: 'Субъект',
        })
        .expect(201);
      const created: City = createResponse.body as City;

      await request(app.getHttpServer())
        .delete(`/api/cities/${created.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 404 for a non-existent city', async () => {
      const accessToken = await loginAsAdmin();

      await request(app.getHttpServer())
        .delete('/api/cities/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
