import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const rawToken =
      client.handshake.auth?.token ||
      (client.handshake.headers.authorization as string);

    const token = rawToken?.startsWith('Bearer ')
      ? rawToken.split(' ')[1]
      : rawToken;

    if (!token) {
      client.disconnect();
      return false;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      return true;
    } catch {
      client.disconnect();
      return false;
    }
  }
}
