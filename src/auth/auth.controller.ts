import { Controller, Post, UseGuards, Res, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { Request, Response } from 'express';
import { IUser } from 'src/users/user.interface';
import { RoleService } from 'src/role/role.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RoleService,
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
}
