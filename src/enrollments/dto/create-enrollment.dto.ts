import { IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty({ message: 'Courses không được bỏ trống!' })
  course_id: string;

  progress: number;
  completed: boolean;
}
