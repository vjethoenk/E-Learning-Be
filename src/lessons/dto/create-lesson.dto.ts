import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsMongoId()
  sectionId: string; // liên kết với Course

  @IsOptional()
  @IsString()
  videoId?: string; // youtube video id sau khi upload

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duration?: number; // số giây
}
