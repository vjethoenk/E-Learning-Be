import { IsNotEmpty } from 'class-validator';

export class CreateSectionDto {
  @IsNotEmpty({ message: 'Tile không được bỏ trống' })
  title: string;

  @IsNotEmpty({ message: 'Order không được bỏ trống' })
  order: number;

  @IsNotEmpty({ message: 'CourseId không được bỏ trống' })
  courseId: string;
}
