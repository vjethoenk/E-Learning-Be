import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';

@Injectable()
export class YoutubeService {
  private oauth2Client;

  constructor() {
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
      access_type: 'offline', // để nhận refresh token
      scope: scopes,
      prompt: 'consent', // bắt buộc show consent
    });
  }

  //Lấy tokens từ code
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  // Hàm parse duration ISO 8601 về số giây
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

  async uploadVideo(
    filePath: string,
    title: string,
    description: string,
    privacyStatus: 'private' | 'unlisted' | 'public' = 'unlisted',
    refreshToken?: string,
  ) {
    if (!refreshToken) throw new Error('Refresh token is required');
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });

    // Upload video
    const res = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: { title, description },
        status: { privacyStatus },
      },
      media: { body: fs.createReadStream(filePath) },
    });

    const videoId = res.data.id!;
    const durationSeconds = await this.getVideoDuration(youtube, videoId);

    return {
      videoId,
      duration: durationSeconds,
    };
  }
}
