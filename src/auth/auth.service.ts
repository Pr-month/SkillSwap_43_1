import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtTokenService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { TAuthTokens, TJwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TAuthTokens> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const payloadWithoutId = {
      email: registerDto.email,
    };

    const temporaryRefreshToken =
      await this.jwtTokenService.signRefreshToken(payloadWithoutId);

    const user = await this.usersService.createUser({
      ...registerDto,
      password: hashedPassword,
      refreshToken: temporaryRefreshToken,
    });

    const payload: TJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtTokenService.signAccessToken(payload);
    const refreshToken = await this.jwtTokenService.signRefreshToken(payload);

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
