import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { YoutubeService } from './youtube.service';
import { Public } from 'src/decorator/customize';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  // Lấy URL login Google
  @Get('auth-url')
  getAuthUrl() {
    return { url: this.youtubeService.generateAuthUrl() };
  }

  // Callback khi Google redirect về
  @Get('callback')
  @Public()
  async oauthCallback(
    @Query('code') code: string,
    @Query('userId') userId: string, // ⚡ cần biết user nào đang login
  ) {
    if (!code) throw new BadRequestException('Code is missing');
    if (!userId) throw new BadRequestException('userId is missing');

    try {
      const tokens = await this.youtubeService.getTokens(code, userId);
      console.log('Google returned tokens:', tokens);
      return { message: 'YouTube connected successfully', tokens };
    } catch (err) {
      console.error(
        'Error exchanging code for tokens:',
        err.response?.data || err.message,
      );
      throw new BadRequestException('Failed to exchange code for tokens');
    }
  }

  // Upload video lên YouTube
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const { title, description, privacyStatus, userId } = body;
    if (!userId) throw new BadRequestException('UserId is required');

    return this.youtubeService.uploadVideo(
      userId,
      file.path,
      title,
      description,
      privacyStatus || 'unlisted',
    );
  }
  @Put(':videoId')
  async updateVideo(
    @Param('videoId') videoId: string,
    @Body() body: { title?: string; description?: string },
  ) {
    return this.youtubeService.updateVideo(videoId, body);
  }

  // DELETE /youtube/:videoId
  @Delete(':videoId')
  async deleteVideo(@Param('videoId') videoId: string) {
    return this.youtubeService.deleteVideo(videoId);
  }
}
