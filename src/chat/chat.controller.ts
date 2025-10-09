import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  // 🟢 Tạo chat mới giữa 2 user hoặc nhóm
  @Post()
  async createChat(
    @Body() body: { participants: string[]; isGroup?: boolean; name?: string },
  ) {
    return this.chatService.createChat(
      body.participants,
      body.isGroup,
      body.name,
    );
  }
  @Post('get-or-create')
  async getOrCreateChat(@Body() body: { userId: string; teacherId: string }) {
    const chat = await this.chatService.getOrCreateChat(
      body.userId,
      body.teacherId,
    );
    return chat;
  }
  // 🟢 Lấy danh sách chat của user
  @Get('user/:userId')
  async getChatsByUser(@Param('userId') userId: string) {
    return this.chatService.getChatsByUser(userId);
  }

  // 🟢 Lấy tin nhắn theo chatId
  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query('limit') limit = '50',
  ) {
    return this.chatService.getMessages(chatId, Number(limit));
  }

  // 🟢 Gửi tin nhắn mới
  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() body: { senderId: string; content: string },
  ) {
    const message = await this.chatService.createMessage(
      chatId,
      body.senderId,
      body.content,
    );
    return message;
  }

  // 🟢 Đánh dấu đã đọc
  @Post(':chatId/messages/read')
  async markAsRead(
    @Param('chatId') chatId: string,
    @Body('userId') userId: string,
  ) {
    await this.chatService.markMessagesAsRead(chatId, userId);
  }
}
