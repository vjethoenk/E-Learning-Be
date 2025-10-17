import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('check')
  async checkEnrollment(
    @Query('userId') userId: string,
    @Query('courseId') courseId: string,
  ) {
    return this.enrollmentsService.checkEnrollment(userId, courseId);
  }
  @Get('statistics')
  async getStatistics() {
    return this.enrollmentsService.getStatistics();
  }

  @Post()
  @ResponseMessage('Create a enrollment')
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @User() user: IUser,
  ) {
    return this.enrollmentsService.create(createEnrollmentDto, user);
  }

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(+id, updateEnrollmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(+id);
  }
  @Get('by-teacher/:teacherId')
  async getStudentsByTeacher(@Param('teacherId') teacherId: string) {
    return this.enrollmentsService.getStudentsByTeacher(teacherId);
  }
}
