import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

export function ApiCategoriesGetAll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получение списка категорий',
      description:
        'Возвращает массив корневых категорий вместе с их подкатегориями (поле children)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Список категорий успешно получен',
    }),
  );
}

export function ApiCategoriesCreate() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создание новой категории',
      description: 'Доступно только для администраторов',
    }),
    ApiBody({ type: CreateCategoryDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Категория успешно создана',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка валидации входящих данных',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Недостаточно прав (требуется роль ADMIN)',
    }),
  );
}

export function ApiCategoriesUpdate() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновление категории по id',
      description: 'Доступно только для администраторов',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID категории',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiBody({ type: UpdateCategoryDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Категория успешно обновлена',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка валидации входящих данных',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Недостаточно прав (требуется роль ADMIN)',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Категория с указанным id не найдена',
    }),
  );
}

export function ApiCategoriesDelete() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удаление категории по id',
      description: 'Доступно только для администраторов',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID категории',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Категория успешно удалена',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Недостаточно прав (требуется роль ADMIN)',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Категория с указанным id не найдена',
    }),
  );
}
