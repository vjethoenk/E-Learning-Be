import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  questionText: string;
}
