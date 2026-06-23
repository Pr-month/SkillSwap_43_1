import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtTokenService } from '../jwt/jwt.service';
import { Request as RequestEntity } from './entities/request.entity';

@WebSocketGateway({ namespace: '/requests' })
export class RequestsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtTokenService.verifyAccessToken(token);
      client.data.user = payload;

      const userId = payload.sub ?? payload.id ?? payload.userId;
      if (userId) {
        client.join(`user:${userId}`);
      }
    } catch {
      client.disconnect();
    }
  }

  notifyRequestCreated(receiverId: string, request: RequestEntity): void {
    this.server.to(`user:${receiverId}`).emit('request.created', request);
  }

  notifyRequestStatusChanged(senderId: string, request: RequestEntity): void {
    this.server.to(`user:${senderId}`).emit('request.status_changed', request);
  }

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth?.token;
    if (auth) return auth;

    const authHeader = client.handshake.headers?.authorization;
    if (authHeader) return authHeader.replace('Bearer ', '');

    return undefined;
  }
}
