import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { City } from '../entities/city.entity';

export function ApiCitiesGetAll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получение списка городов',
      description:
        'Возвращает до 10 городов, отсортированных по названию. При передаче query-параметра name фильтрует города по частичному совпадению названия.',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      description: 'Часть названия города для поиска',
      example: 'Москва',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Список городов успешно получен',
      type: [City],
    }),
  );
}

export function ApiCitiesCreate() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создание нового города',
      description: 'Доступно только для администраторов',
    }),
    ApiBody({ type: CreateCityDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Город успешно создан',
      type: City,
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

export function ApiCitiesUpdate() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновление города по id',
      description: 'Доступно только для администраторов',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID города',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiBody({ type: UpdateCityDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Город успешно обновлен',
      type: City,
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
      description: 'Город с указанным id не найден',
    }),
  );
}

export function ApiCitiesDelete() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удаление города по id',
      description: 'Доступно только для администраторов',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID города',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Город успешно удален',
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
      description: 'Город с указанным id не найден',
    }),
  );
}
