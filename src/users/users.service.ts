import { Injectable } from '@nestjs/common';
import { PatchCurrentUserDto } from './dto';

@Injectable()
export class UsersService {
  patchCurrentUser(data: PatchCurrentUserDto) {
    return 'Этот эндпоинт обновляет данные текущего пользователя';
  }
}
