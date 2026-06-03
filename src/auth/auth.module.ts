import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenGuard } from './accessToken.guard';
import { RefreshTokenGuard } from './refreshToken.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { JwtModule } from '../jwt/jwt.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'access-token' }),
    JwtModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenGuard,
    RefreshTokenGuard,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [AccessTokenGuard, RefreshTokenGuard],
})
export class AuthModule {}
