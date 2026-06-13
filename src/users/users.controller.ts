import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import {
  ApiUsersFindAll,
  ApiUsersFindMe,
  ApiUsersPatchMe,
  ApiUsersUpdatePassword,
} from './docs/users.swagger';
import { PatchCurrentUserDto } from './dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiUsersFindMe()
  @UseGuards(AccessTokenGuard)
  @Get('me')
  findMe(@Req() request: AuthenticatedRequest): Promise<User> {
    return this.usersService.findById(request.user.id);
  }

  @ApiUsersUpdatePassword()
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Patch('me/password')
  updateMyPassword(
    @Req() request: AuthenticatedRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    return this.usersService.updatePassword(
      request.user.id,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword,
    );
  }

  @ApiUsersFindAll()
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiUsersPatchMe()
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @Patch('me')
  patchCurrentUser(
    @Req() request: AuthenticatedRequest,
    @Body() patchCurrentUserDto: PatchCurrentUserDto,
  ) {
    return this.usersService.patchCurrentUser(
      request.user.id,
      patchCurrentUserDto,
    );
  }
}
