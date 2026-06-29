import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ChangeRequestStatusDto } from '../dto/changeRequestStatus.dto';
import { CreateRequestDto } from '../dto/createRequest.dto';

export function ApiRequestsCreate() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создание заявки на обмен навыками',
      description:
        'Отправляет заявку владельцу запрошенного навыка с предложением обмена',
    }),
    ApiBody({ type: CreateRequestDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Заявка успешно создана',
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
      description: 'Один из указанных навыков не найден',
    }),
  );
}

export function ApiRequestsGetIncoming() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получение списка входящих заявок',
      description:
        'Возвращает активные заявки текущего пользователя со статусами pending и inProgress',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Список входящих заявок успешно получен',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    }),
  );
}

export function ApiRequestsGetOutgoing() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получение списка исходящих заявок',
      description:
        'Возвращает активные заявки, отправленные текущим пользователем, со статусами pending и inProgress',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Список исходящих заявок успешно получен',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    }),
  );
}

export function ApiRequestsChangeStatus() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Изменение статуса заявки',
      description:
        'Позволяет принять, отклонить или обновить статус заявки. При принятии заявки навыки автоматически добавляются обоим участникам',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID заявки',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiBody({ type: ChangeRequestStatusDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Статус заявки успешно изменён',
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
      description: 'Недостаточно прав для изменения этой заявки',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Заявка с указанным id не найдена',
    }),
  );
}

export function ApiRequestsDelete() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удаление заявки',
      description:
        'Обычный пользователь может удалять только свои отправленные заявки. Администратор может удалить любую заявку.',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID заявки',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Заявка успешно удалена',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Пользователь не авторизован',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Недостаточно прав для удаления этой заявки',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Заявка с указанным id не найдена',
    }),
  );
}
