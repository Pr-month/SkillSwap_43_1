import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Reflector } from '@nestjs/core';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { AppModule } from '../src/app.module';
import { AllExceptionFilter } from 'src/common/filters/all-exception.filter';

describe('FilesController (e2e)', () => {
  let app: INestApplication<App>;
  const uploadedFiles: string[] = [];

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
  });

  afterAll(async () => {
    await Promise.all(
      uploadedFiles.map(async (fileUrl) => {
        const filePath = join(process.cwd(), 'public', fileUrl);

        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      }),
    );

    await app.close();
  });

  it('uploads one image file', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/upload')
      .attach(
        'files',
        join(process.cwd(), 'test', 'fixtures', 'test-image.png'),
      )
      .expect(201);

    const body = response.body as string[];

    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatch(/^\/uploads\/.+\.png$/);

    uploadedFiles.push(...body);

    const savedFilePath = join(process.cwd(), 'public', body[0]);
    expect(existsSync(savedFilePath)).toBe(true);
  });

  it('uploads multiple image files', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/upload')
      .attach(
        'files',
        join(process.cwd(), 'test', 'fixtures', 'test-image.png'),
      )
      .attach(
        'files',
        join(process.cwd(), 'test', 'fixtures', 'test-image-2.png'),
      )
      .expect(201);

    const body = response.body as string[];

    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
    expect(body[0]).toMatch(/^\/uploads\/.+\.png$/);
    expect(body[1]).toMatch(/^\/uploads\/.+\.png$/);

    uploadedFiles.push(...body);

    for (const fileUrl of body) {
      const savedFilePath = join(process.cwd(), 'public', fileUrl);
      expect(existsSync(savedFilePath)).toBe(true);
    }
  });

  it('rejects unsupported file type', async () => {
    await request(app.getHttpServer())
      .post('/files/upload')
      .attach('files', join(process.cwd(), 'test', 'fixtures', 'test-file.txt'))
      .expect(400);
  });
});
