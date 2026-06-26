import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

export function ApiAuthRegister() {
  return applyDecorators(
    ApiOperation({
      summary: 'Регистрация нового пользователя',
      description:
        'Создаёт нового пользователя и возвращает пару access/refresh токенов',
    }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Пользователь успешно зарегистрирован, возвращены токены',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка валидации входящих данных',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Пользователь с таким email уже существует',
    }),
  );
}

export function ApiAuthLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'Вход в аккаунт',
      description:
        'Аутентифицирует пользователя по email и паролю, возвращает пару токенов',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Успешный вход, возвращены access- и refresh-токены',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Ошибка валидации входящих данных',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Неверный email или пароль',
    }),
  );
}

export function ApiAuthRefresh() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновление пары токенов',
      description:
        'Принимает refresh-токен в заголовке Authorization и возвращает новую пару токенов',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Токены успешно обновлены',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Refresh-токен невалиден, истёк или отсутствует',
    }),
  );
}
