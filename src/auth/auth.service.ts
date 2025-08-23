import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  //Chạy khi login
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(username);
    if (user) {
      const isValid = await this.usersService.isValidPassword(
        pass,
        user.password,
      );
      if (isValid === true) {
        return user;
      }
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    const refreshToken = await this.createRefreshToken(payload);
    await this.usersService.updateRefreshToken(refreshToken, _id);

    const refreshTokenExpire = ms(
      this.configService.get<string>('JWT_REFRESH_EXPIRE'),
    );

    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      maxAge: refreshTokenExpire,
    });
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
      },
    };
  }

  createRefreshToken = (payload: any) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
    return refreshToken;
  };

  async newToken(refreshToken: string, response: Response) {
    try {
      // Giải mã refresh_token
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findRefreshToken(refreshToken);

      if (!user) {
        throw new BadRequestException('Token không hợp lệ. Vui lòng login.');
      }

      const userRefresh = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };
      response.clearCookie('refresh_token');
      return await this.login(userRefresh, response);
    } catch (error) {
      throw new BadRequestException('Token không hợp lệ. Vui lòng login.');
    }
  }
}
