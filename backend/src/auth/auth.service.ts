import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtTokenService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TAuthTokens, TJwtPayload } from './auth.types';
import { City } from '../cities/entities/city.entity';
import { CitiesService } from '../cities/cities.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly citiesService: CitiesService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TAuthTokens> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const payloadWithoutId = {
      email: registerDto.email,
    };

    const temporaryRefreshToken =
      await this.jwtTokenService.signRefreshToken(payloadWithoutId);

    const reqCity = await this.citiesService.findByName(registerDto.city);

    const user = await this.usersService.createUser({
      ...registerDto,
      password: hashedPassword,
      refreshToken: temporaryRefreshToken,
      city: reqCity as City,
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

  async login(loginDto: LoginDto): Promise<TAuthTokens> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

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

  async refreshTokens(
    userId: string,
    currentRefreshToken: string,
  ): Promise<TAuthTokens> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (user.refreshToken !== currentRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

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
