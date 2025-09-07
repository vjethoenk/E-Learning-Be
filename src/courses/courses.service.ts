import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: SoftDeleteModel<CourseDocument>,
  ) {}
  async create(createCourseDto: CreateCourseDto, user: IUser) {
    return await this.courseModel.create({
      ...createCourseDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const limitDefault = pageSize ? pageSize : 10;
    const totalItems = await this.courseModel.countDocuments();
    const totalPage = Math.ceil(totalItems / limitDefault);
    const offset = pageSize * (current - 1);

    const result = await this.courseModel
      .find(filter)
      .skip(offset)
      .limit(limitDefault)
      .sort(sort as any)
      .select(projection)
      .populate(population)
      .exec();

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPage,
        totalItem: totalItems,
      },
      result,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
