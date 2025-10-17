import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  ProfileUserDto,
  RegisterUserDto,
  UpdatePasswordDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @ResponseMessage('Create a user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('register')
  @Public()
  @ResponseMessage('Register success')
  createRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  @Get()
  @ResponseMessage('Show pagination ')
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query() qs,
  ) {
    return this.usersService.findAll(+current, +pageSize, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') _id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.update(_id, updateUserDto, user);
  }

  @Put('profile/:id')
  updateProfile(
    @Param('id') _id: string,
    @Body() profileUserDto: ProfileUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.updateProfile(_id, profileUserDto, user);
  }

  @Put('password/:id')
  updatePassword(
    @Param('id') _id: string,
    @Body() passDto: UpdatePasswordDto,
    @User() user: IUser,
  ) {
    return this.usersService.updatePassword(_id, passDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
