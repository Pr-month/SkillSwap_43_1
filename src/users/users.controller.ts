import { Body, Controller, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { PatchCurrentUserDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  patchCurrentUser(@Body() patchCurrentUserDto: PatchCurrentUserDto) {
    return this.usersService.patchCurrentUser(patchCurrentUserDto);
  }
}
