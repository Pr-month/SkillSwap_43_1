import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function ApiFilesUpload() {
  return applyDecorators(
    ApiOperation({
      summary: 'Загрузка файлов на сервер',
      description:
        'Принимает до 10 изображений (jpeg, jpg, png, webp) размером не более 2 МБ каждое. Возвращает массив публичных ссылок на загруженные файлы.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Multipart-форма с массивом файлов в поле files',
      schema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Файлы успешно загружены, возвращён массив публичных ссылок',
      schema: {
        type: 'array',
        items: {
          type: 'string',
          example: '/uploads/550e8400-e29b-41d4-a716-446655440000.png',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Недопустимый тип файла (разрешены только jpeg, jpg, png, webp)',
    }),
    ApiResponse({
      status: HttpStatus.PAYLOAD_TOO_LARGE,
      description: 'Размер файла превышает 2 МБ',
    }),
  );
}
