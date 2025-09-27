import { isNotEmpty, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty({ message: 'User_id không được bỏ trống!' })
  user_id: string;

  @IsNotEmpty({ message: 'Courses không được bỏ trống!' })
  course_id: string;

  @IsNotEmpty()
  status: string;
}
