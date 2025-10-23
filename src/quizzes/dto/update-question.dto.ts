import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateAnswerDto {
  @IsOptional()
  answerText?: string;

  @IsOptional()
    isCorrect?: boolean;
    order?: number;
}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @IsOptional()
  quiz_id?: string;

  @IsOptional()
  questionText?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers?: UpdateAnswerDto[];
}
