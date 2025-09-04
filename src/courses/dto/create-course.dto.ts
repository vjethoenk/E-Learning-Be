import { IsNotEmpty } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Title không được bỏ trống!' })
  title: string;

  @IsNotEmpty({ message: 'Description không được bỏ trống!' })
  description: string;

  @IsNotEmpty({ message: 'Thumbnail không được bỏ trống!' })
  thumbnail: string;

  @IsNotEmpty({ message: 'Price không được bỏ trống!' })
  price: number;

  @IsNotEmpty({ message: 'CategoryId không được bỏ trống!' })
  categoryId: string;
}
