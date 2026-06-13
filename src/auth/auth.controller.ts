import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthRefreshRequest, TAuthTokens } from './auth.types';
import {
  ApiAuthLogin,
  ApiAuthRefresh,
  ApiAuthRegister,
} from './docs/auth.swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiAuthRegister()
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<TAuthTokens> {
    return this.authService.register(registerDto);
  }

  @ApiAuthLogin()
  @HttpCode(200)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TAuthTokens> {
    return this.authService.login(loginDto);
  }

  @ApiAuthRefresh()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post('refresh')
  refresh(@Req() req: AuthRefreshRequest): Promise<TAuthTokens> {
    return this.authService.refreshTokens(req.user.sub, req.refreshToken);
  }
}
