import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PatchCurrentUserDto } from '../dto/patchCurrentUser.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';

export function ApiUsersFindMe() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получение профиля текущего пользователя',
      description:
        'Возвращает данные авторизованного пользователя без полей password и refreshToken',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Данные текущего пользователя успешно получены',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован или access-токен невалиден',
    }),
  );
}

export function ApiUsersUpdatePassword() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновление пароля текущего пользователя',
      description: 'Проверяет текущий пароль и заменяет его на новый',
    }),
    ApiBody({ type: UpdatePasswordDto }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Пароль успешно обновлён',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка валидации входящих данных',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован или текущий пароль неверен',
    }),
  );
}

export function ApiUsersFindAll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получение списка всех пользователей',
      description:
        'Возвращает массив всех пользователей без полей password и refreshToken',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Список пользователей успешно получен',
    }),
  );
}

export function ApiUsersPatchMe() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Частичное обновление профиля текущего пользователя',
      description:
        'Обновляет указанные поля профиля авторизованного пользователя',
    }),
    ApiBody({ type: PatchCurrentUserDto }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Профиль успешно обновлён',
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
      status: HttpStatus.CONFLICT,
      description: 'Email уже используется другим пользователем',
    }),
  );
}
