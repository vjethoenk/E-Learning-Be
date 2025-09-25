import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Name khong duoc de trong' })
  name: string;

  @IsNotEmpty({ message: 'Thumbnail khong duoc de trong' })
  thumbnail: string;

  @IsNotEmpty({ message: 'Description khong duoc de trong' })
  description: string;

  @IsNotEmpty({ message: 'Color khong duoc de trong' })
  color: string;

  @IsNotEmpty({ message: 'Name khong duoc de trong' })
  icon: string;
}
