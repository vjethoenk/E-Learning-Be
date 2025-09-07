import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { YoutubeService } from './youtube.service';
import { Public } from 'src/decorator/customize';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  // login Google
  @Get('auth-url')
  getAuthUrl() {
    return { url: this.youtubeService.generateAuthUrl() };
  }

  //Callback sau khi login lưu refresh token
  @Get('callback')
  @Public()
  async oauthCallback(@Query('code') code: string) {
    if (!code) throw new BadRequestException('Code is missing');

    const tokens = await this.youtubeService.getTokens(code);
    console.log('Refresh token:', tokens.refresh_token);
    return tokens;
  }

  //Upload video
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const { title, description, privacyStatus, refreshToken } = body;
    if (!refreshToken)
      throw new BadRequestException('No refresh token provided');

    return this.youtubeService.uploadVideo(
      file.path,
      title,
      description,
      privacyStatus || 'unlisted',
      refreshToken,
    );
  }
}
