import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  ProfileUserDto,
  RegisterUserDto,
  UpdatePasswordDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

import { Role, RoleDocument } from 'src/role/schemas/role.schema';
import aqp from 'api-query-params';
import { IUser } from './user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  hashPassword = (password: string) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };

  isValidPassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
  };

  updateRefreshToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  };

  async create(createUserDto: CreateUserDto) {
    const pass = this.hashPassword(createUserDto.password);
    createUserDto.password = pass;
    return await this.userModel.create({ ...createUserDto });
  }

  async register(registerDto: RegisterUserDto) {
    const getByRoleUser = await this.roleModel.findOne({ name: 'USER' });
    const pass = this.hashPassword(registerDto.password);
    registerDto.password = pass;

    if (getByRoleUser?._id) {
      registerDto.role = getByRoleUser._id;
    } else {
      console.error('Không tìm thấy role user để gán!');
    }

    const newUser = await this.userModel.create({ ...registerDto });

    console.log('UserId:', newUser._id);

    return {
      message: 'Đăng ký thành công',
      userId: newUser._id,
    };
  }

  findRefreshToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).populate({
      path: 'role',
      select: { name: 1 },
    });
  };

  findOneByUserName(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({
        path: 'role',
        select: { name: 1 },
      });
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const limitDefault = pageSize && pageSize > 0 ? pageSize : 10;
    const totalItems = await this.userModel.countDocuments({
      ...filter,
      isDeleted: false,
    });

    const totalPage = Math.ceil(totalItems / limitDefault);
    const offset = limitDefault * (current - 1);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(limitDefault)
      .sort(sort as any)
      .select(projection)
      .populate(population)
      .exec();

    return {
      meta: {
        current,
        pageSize: limitDefault,
        pages: totalPage,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    // return (await this.roleModel.findById(id))!.populate({
    //   path: 'permissions',
    //   select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
    // });
    return await this.userModel.findOne({ _id: id });
  }

  async update(_id: string, updateUserDto: UpdateUserDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('not found role');
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

  async updateProfile(_id: string, updateUserDto: ProfileUserDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('not found role');
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

  async updatePassword(_id: string, passDto: UpdatePasswordDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('not found role');
    }
    const profile = await this.userModel.findOne({ _id });
    const isValid = this.isValidPassword(
      passDto.password,
      profile?.password as string,
    );
    if (!isValid) {
      throw new BadRequestException('Mật khẩu không hợp lệ!');
    }
    if (passDto.newPassword === passDto.confirmPassword) {
      passDto.newPassword = this.hashPassword(passDto.newPassword);
      const updatePass = await this.userModel.updateOne(
        { _id },
        { password: passDto.newPassword },
      );
      return updatePass;
    }
  }

  remove(id: string) {
    return this.userModel.softDelete({ _id: id });
  }
}
