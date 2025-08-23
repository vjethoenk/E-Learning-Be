import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { Public, ResponseMessage } from './decorator/customize';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}

  // @UseGuards(LocalAuthGuard)
  // @ResponseMessage('Login success')
  // @Public()
  // @Post('/login')
  // async login(@Request() req) {
  //   return this.authService.login(req.user);
  // }
}
