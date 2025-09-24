import { Injectable, BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';

@Injectable()
export class YoutubeService {
  private oauth2Client;

  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  // Tạo URL login Google
  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
    ];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  // Lấy token và lưu refresh_token vào user
  async getTokens(code: string, userId: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    if (tokens.refresh_token) {
      await this.userModel.updateOne(
        { _id: userId },
        { refreshToken: tokens.refresh_token },
      );
    }

    return tokens;
  }

  // Làm mới access_token từ refresh_token
  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken)
      throw new BadRequestException('Refresh token is required');

    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  // Parse duration ISO 8601 về số giây
  private parseDuration(isoDuration: string): number {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);
    if (!matches) return 0;

    const hours = parseInt(matches[1] || '0', 10);
    const minutes = parseInt(matches[2] || '0', 10);
    const seconds = parseInt(matches[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  private async getVideoDuration(youtube, videoId: string): Promise<number> {
    for (let i = 0; i < 5; i++) {
      const detailRes = await youtube.videos.list({
        part: ['contentDetails'],
        id: [videoId],
      });

      const isoDuration = detailRes.data.items?.[0]?.contentDetails?.duration;
      if (isoDuration && isoDuration !== 'P0D') {
        return this.parseDuration(isoDuration);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    return 0;
  }

  // Upload video lên YouTube
  async uploadVideo(
    userId: string,
    filePath: string,
    title: string,
    description: string,
    privacyStatus: 'private' | 'unlisted' | 'public' = 'unlisted',
  ) {
    // Lấy refresh token từ DB
    // const user = await this.userModel.findById(userId);
    // if (!user || !user.refreshToken) {
    //   throw new BadRequestException('User has not connected YouTube');
    // }
    const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
    // Đặt credentials từ refreshToken
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    await this.oauth2Client.getAccessToken();

    const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

    try {
      const res = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: { title, description },
          status: { privacyStatus },
        },
        media: {
          body: fs.createReadStream(filePath),
        },
      });

      const videoId = res.data.id!;
      const durationSeconds = await this.getVideoDuration(youtube, videoId);

      return { videoId, duration: durationSeconds };
    } catch (error) {
      console.error(
        'Error during video upload:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Upload video failed');
    }
  }

  // Update user
  async update(_id: string, updateUserDto: any, user: any) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('User not found');
    }
    return await this.userModel.updateOne(
      { _id },
      {
        ...updateUserDto,
        updateBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }
}
