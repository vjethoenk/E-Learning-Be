import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  Query,
  Put,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  create(
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFile() file: Express.Multer.File,
    @User() user: IUser,
  ) {
    return this.lessonsService.create(createLessonDto, file, user);
  }

  @Get('/sectionId/:id')
  @Public()
  @ResponseMessage('Fetch api lessons')
  findAll(
    @Param('id') id: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query() qs,
  ) {
    return this.lessonsService.findAll(id, +current, +pageSize, qs);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Get('count/:id')
  @Public()
  countLesson(@Param('id') id: string) {
    return this.lessonsService.countLes(id);
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @User() user: IUser,
  ) {
    return this.lessonsService.update(id, updateLessonDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.lessonsService.remove(id, user);
  }
}
