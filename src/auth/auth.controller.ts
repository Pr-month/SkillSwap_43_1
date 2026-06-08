import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRefreshRequest, TAuthTokens } from './auth.types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<TAuthTokens> {
    return this.authService.register(registerDto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TAuthTokens> {
    return this.authService.login(loginDto);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post('refresh')
  refresh(@Req() req: AuthRefreshRequest): Promise<TAuthTokens> {
    return this.authService.refreshTokens(req.user.sub, req.refreshToken);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post('logout')
  logout(@Req() req: AuthRefreshRequest): Promise<void> {
    return this.authService.logout(req.user.sub, req.refreshToken);
  }
}
