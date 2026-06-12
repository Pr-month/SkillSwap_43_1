import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateSkillDto } from '../dto/create-skill.dto';
import { GetSkillsResponseDto } from '../dto/get-skills-response.dto';
import { UpdateSkillDto } from '../dto/update-skill.dto';

export function ApiSkillsCreate() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создание нового навыка',
      description:
        'Создаёт навык от имени текущего авторизованного пользователя',
    }),
    ApiBody({ type: CreateSkillDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Навык успешно создан',
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
      status: HttpStatus.NOT_FOUND,
      description: 'Указанная категория не найдена',
    }),
  );
}

export function ApiSkillsUpdate() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновление навыка по id',
      description: 'Обновить навык может только его владелец',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiBody({ type: UpdateSkillDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Навык успешно обновлён',
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
      description: 'Нет прав на обновление чужого навыка',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Навык с указанным id не найден',
    }),
  );
}

export function ApiSkillsAddToFavorites() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Добавление навыка в избранное',
      description:
        'Добавляет указанный навык в список избранных текущего пользователя',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Навык успешно добавлен в избранное',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Навык с указанным id не найден',
    }),
  );
}

export function ApiSkillsRemoveFromFavorites() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удаление навыка из избранного',
      description:
        'Удаляет указанный навык из списка избранных текущего пользователя',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Навык успешно удалён из избранного',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Навык с указанным id не найден',
    }),
  );
}

export function ApiSkillsFindAll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получение списка навыков с фильтрацией и пагинацией',
      description:
        'Публичный эндпоинт. Возвращает массив навыков, отфильтрованных по query-параметрам, с информацией о пагинации.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Список навыков успешно получен',
      type: GetSkillsResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка валидации query-параметров',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Запрашиваемая страница превышает общее количество страниц',
    }),
  );
}

export function ApiSkillsDelete() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удаление навыка по id',
      description:
        'Удалить навык может только его владелец. Изображения навыка также удаляются с сервера.',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Навык успешно удалён',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Нет прав на удаление чужого навыка',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Навык с указанным id не найден',
    }),
  );
}
