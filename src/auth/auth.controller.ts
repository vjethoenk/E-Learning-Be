import { Controller, Post, UseGuards, Res, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { Request, Response } from 'express';
import { IUser } from 'src/users/user.interface';
import { RoleService } from 'src/role/role.service';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login success')
  @Public()
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @ResponseMessage('Get user information')
  @Get('account')
  async handleGetAccount(@User() user: IUser) {
    const temp = (await this.roleService.findOne(user.role._id)) as any;
    user.permissions = temp.permissions;
    return { user };
  }

  @Get('refresh')
  @Public()
  @ResponseMessage('Get user by refresh token')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh-token'];
    return this.authService.newToken(refreshToken, response);
  }

  @Get('mail')
  @Public()
  @ResponseMessage('Send email success')
  testMail() {
    this.mailerService.sendMail({
      to: 'ductk1705@gmail.com', // list of receivers
      subject: 'Testing Nest MailerModule ✔', // Subject line
      text: 'welcome', // plaintext body
      html: '<b>Hello Hoang tao test api thoi</b>', // HTML body content
    });
    return 'Ok mail đã gửi';
  }
  @Post('logout')
  @ResponseMessage('Logout success')
  logout(@Res({ passthrough: true }) response: Response, @User() user: IUser) {
    this.authService.logout(response, user);
  }
}
