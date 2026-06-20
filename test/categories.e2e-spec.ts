import { Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { DeleteResult } from 'typeorm';

import { AppModule } from '../src/app.module';
import { TAuthTokens } from '../src/auth/auth.types';
import { LoginDto } from '../src/auth/dto/login.dto';
import { CreateCategoryDto } from '../src/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../src/categories/dto/update-category.dto';
import { Category } from '../src/categories/entities/category.entity';
import { AllExceptionFilter } from '../src/common/filters/all-exception.filter';
import { AppDataSource } from '../src/config/database.config';
import { seedCategories } from '../src/scripts/seed.categories';
import { ADMIN_DATA, USERS_DATA } from '../src/scripts/data/users.data';

describe('Categories (e2e)', () => {
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
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    await app.close();
  });

  describe('/api/categories (GET)', () => {
    it('should return all parent categories', async () => {
      await seedCategories();

      const response: request.Response = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);
      const categories: Category[] = response.body as Category[];

      expect(categories).toBeInstanceOf(Array<Category>);
      expect(categories.length).toBeGreaterThan(0);
      categories.forEach((element) => {
        expect(element).toHaveProperty('id');
        expect(element).toHaveProperty('name');
        expect(element).toHaveProperty('children');
        expect(element).not.toHaveProperty('parent');
      });
    });
  });

  describe('/api/categories (POST)', () => {
    const newCategoryRequest: CreateCategoryDto = {
      name: 'Тестовая категория',
    };

    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .post('/api/categories')
        .send(newCategoryRequest)
        .expect(401);
    });

    it('should return 403 without admin role', async () => {
      const accessToken = await loginAsUser();

      await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newCategoryRequest)
        .expect(403);
    });

    it('should create a new category with admin role', async () => {
      const accessToken = await loginAsAdmin();

      const postResponse = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newCategoryRequest)
        .expect(201);
      const createdData: Category = postResponse.body as Category;

      expect(createdData).toHaveProperty('id');
      expect(createdData.name).toBe(newCategoryRequest.name);

      const catsResponse = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);
      const categories: Category[] = catsResponse.body as Category[];
      const categoryIds = categories.map((cat) => cat.id);
      expect(categoryIds).toContain(createdData.id);
    });
  });

  describe('/api/categories/{category_id} (PATCH)', () => {
    const updateCategoryRequest: UpdateCategoryDto = {
      name: 'Обновленная категория',
    };

    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .patch('/api/categories/00000000-0000-0000-0000-000000000000')
        .send(updateCategoryRequest)
        .expect(401);
    });

    it('should return 403 without admin role', async () => {
      const accessToken = await loginAsUser();

      await request(app.getHttpServer())
        .patch('/api/categories/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateCategoryRequest)
        .expect(403);
    });

    it('should update a category with admin role', async () => {
      const accessToken = await loginAsAdmin();

      const newCategoryRequest: CreateCategoryDto = {
        name: 'Категория до обновления',
      };

      const postResponse = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newCategoryRequest)
        .expect(201);
      const createdData: Category = postResponse.body as Category;

      const updResponse = await request(app.getHttpServer())
        .patch(`/api/categories/${createdData.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateCategoryRequest)
        .expect(200);
      const updCategory: Category = updResponse.body as Category;
      expect(updCategory.id).toEqual(createdData.id);
      expect(updCategory.name).toEqual(updateCategoryRequest.name);
    });
  });

  describe('/api/categories/{category_id} (DELETE)', () => {
    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .delete('/api/categories/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });

    it('should return 403 without admin role', async () => {
      const accessToken = await loginAsUser();

      await request(app.getHttpServer())
        .delete('/api/categories/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should update a category with admin role', async () => {
      const accessToken = await loginAsAdmin();
      const newCategoryRequest: CreateCategoryDto = {
        name: 'Удаляемая категория',
      };

      const postResponse = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newCategoryRequest)
        .expect(201);
      const categoryToDelete: Category = postResponse.body as Category;

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/categories/${categoryToDelete.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const result: DeleteResult = deleteResponse.body as DeleteResult;
      expect(result.affected).toEqual(1);

      const catsResponse = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);
      const categories: Category[] = catsResponse.body as Category[];
      const categoryIds = categories.map((cat) => cat.id);
      expect(categoryIds).not.toContain(categoryToDelete.id);
    });
  });
});
