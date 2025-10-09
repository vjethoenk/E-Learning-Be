import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';

//@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(chatId);
    console.log(`user joined chat ${chatId}`);
  }

  // Gửi message và broadcast lại cho room
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any) {
    const saved = await this.chatService.createMessage(
      data.chatId,
      data.senderId,
      data.content,
    );

    console.log('Sending message to room:', data.chatId);

    this.server.to(data.chatId).emit('newMessage', saved);
    return saved;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { chatId: string; userId: string },
  ) {
    await this.chatService.markMessagesAsRead(data.chatId, data.userId);
    this.server.to(data.chatId).emit('messagesRead', data.userId);
  }
}
