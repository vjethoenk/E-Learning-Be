import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import mongoose from 'mongoose';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const checkName = await this.roleModel.findOne({
      name: createRoleDto.name,
    });
    if (checkName) {
      throw new BadRequestException('Name đã tồn tại');
    }
    return await this.roleModel.create({
      ...createRoleDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async findAll() {
    return await this.roleModel.find();
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id không tồn tại!');
    }

    const role = await this.roleModel.findOne({ _id: id });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // return role.populate({
    //   path: 'permissions',
    //   select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
    // });
    return role;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
