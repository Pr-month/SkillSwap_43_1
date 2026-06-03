import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { PatchCurrentUserDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  findMe(@Req() request: AuthenticatedRequest): Promise<User> {
    return this.usersService.findById(request.user.id);
  }

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

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

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
