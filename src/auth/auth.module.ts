import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenGuard } from './accessToken.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'access-token' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn =
          configService.get<string>('jwt.access.expiresIn') ?? '1h';

        return {
          secret: configService.getOrThrow<string>('jwt.access.secret'),
          signOptions: {
            expiresIn: expiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenGuard, AccessTokenStrategy],
  exports: [AccessTokenGuard],
})
export class AuthModule {}
