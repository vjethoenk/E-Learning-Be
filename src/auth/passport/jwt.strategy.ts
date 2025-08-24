import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/user.interface';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private roleService: RoleService,
  ) {
    //Giải mã token
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET')!,
    });
  }

  async validate(payload: IUser) {
    const { _id, name, email, role } = payload;

    // cần gán thêm permissions vào req.user
    const userRole = role as unknown as { _id: string; name: string };
    const roleCheck = await this.roleService.findOne(userRole._id);

    if (!roleCheck) {
      throw new NotFoundException('Role not found');
    }
    const temp = roleCheck.toObject();

    //req.user
    return {
      _id,
      name,
      email,
      role,
      permissions: temp?.permissions ?? [],
    };
  }
}
