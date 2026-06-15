import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokenService } from '../../jwt/jwt.service';

interface WsClient {
  handshake?: {
    auth?: { token?: string };
    headers?: { authorization?: string };
  };
  data: Record<string, unknown>;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  private extractToken(client: WsClient): string | undefined {
    const auth = client.handshake?.auth?.token;
    if (auth) return auth;

    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader) return authHeader.replace('Bearer ', '');

    return undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<WsClient>();
    const token = this.extractToken(client);

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = await this.jwtTokenService.verifyAccessToken(token);
      client.data = { ...client.data, user: payload };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
