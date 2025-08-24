import { IsEmail, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name không được bỏ trống' })
  name: string;

  @IsEmail({}, { message: 'Sai định dạng email' })
  @IsNotEmpty({ message: 'Email không được bỏ trống' })
  email: string;

  @IsNotEmpty({ message: 'Password không được bỏ trống' })
  password: string;

  @IsNotEmpty({ message: 'Role không được để trống' })
  role: mongoose.Schema.Types.ObjectId;
}
export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name không được bỏ trống' })
  name: string;

  @IsEmail({}, { message: 'Sai định dạng email' })
  @IsNotEmpty({ message: 'Email không được bỏ trống' })
  email: string;

  @IsNotEmpty({ message: 'Password không được bỏ trống' })
  password: string;
}
