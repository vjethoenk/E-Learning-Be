import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsObject()
  author?: {
    name: string;
    avatar: string;
    bio?: string;
  };

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  content?: any[];

  @IsOptional()
  toc?: any[];

  @IsOptional()
  related?: any[];

  @IsOptional()
  comments?: any[];

  @IsOptional()
  @IsArray()
  categories?: string[];

  @IsOptional()
  latestPosts?: any[];
}
