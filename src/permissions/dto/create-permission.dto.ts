import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'ApiPath không được bỏ trống' })
  name: string;

  @IsNotEmpty({ message: 'ApiPath không được bỏ trống' })
  apiPath: string;

  @IsNotEmpty({ message: 'Method không được bỏ trống' })
  method: string;

  @IsNotEmpty({ message: 'Module không được bỏ trống' })
  module: string;
}
