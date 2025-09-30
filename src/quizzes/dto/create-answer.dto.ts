import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  answerText: string;

  @IsInt()
  order: number;

  @IsBoolean()
  isCorrect: boolean;
}
