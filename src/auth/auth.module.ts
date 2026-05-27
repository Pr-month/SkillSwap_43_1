import { Module } from '@nestjs/common';
import { JwtModule } from '../jwt/jwt.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [JwtModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenStrategy],
})
export class AuthModule {}
