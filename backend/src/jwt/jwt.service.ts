import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig, TJwtConfig } from '../config/jwt.config';

@Injectable()
export class JwtTokenService {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfig: TJwtConfig,
    private readonly jwtService: JwtService,
  ) {}

  signAccessToken(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.access.secret,
      expiresIn: this.jwtConfig.access.expiresIn,
    });
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.jwtConfig.access.secret,
    });
  }

  signRefreshToken(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refresh.secret,
      expiresIn: this.jwtConfig.refresh.expiresIn,
    });
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.jwtConfig.refresh.secret,
    });
  }
}
