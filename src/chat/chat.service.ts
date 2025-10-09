import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, Message } from './schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async createChat(participants: string[], isGroup = false, name?: string) {
    return this.chatModel.create({
      participants: participants.map((id) => new Types.ObjectId(id)),
      isGroup,
      name,
    });
  }

  async getOrCreateChat(userId: string, teacherId: string) {
    let chat = await this.chatModel.findOne({
      participants: { $all: [userId, teacherId] },
    });

    if (!chat) {
      chat = await this.chatModel.create({
        participants: [userId, teacherId],
      });
    }

    return chat;
  }
  async getChatsByUser(userId: string) {
    return this.chatModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate('lastMessage')
      .lean();
  }

  async getMessages(chatId: string, limit = 50) {
    return this.messageModel
      .find({ chatId: new Types.ObjectId(chatId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'email')
      .lean();
  }

  async createMessage(chatId: string, senderId: string, content: string) {
    const message = await this.messageModel.create({
      chatId: new Types.ObjectId(chatId),
      senderId: new Types.ObjectId(senderId),
      content,
    });

    await this.chatModel.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });

    return message.populate('senderId', 'email');
  }

  async markMessagesAsRead(chatId: string, userId: string) {
    await this.messageModel.updateMany(
      { chatId, readBy: { $ne: userId } },
      { $push: { readBy: userId } },
    );
  }
}
