import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { JwtModule } from '../jwt/jwt.module';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from './guards/role.guard';

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
    RolesGuard,
  ],
  exports: [AccessTokenGuard, RefreshTokenGuard, RolesGuard],
})
export class AuthModule {}
