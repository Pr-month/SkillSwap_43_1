import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TAuthTokens } from './auth.types';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<TAuthTokens> {
    return this.authService.register(registerDto);
  }
}
