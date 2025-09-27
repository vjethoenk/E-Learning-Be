import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { emit } from 'process';

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
        name: user.name,
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
      .populate('categoryId', 'name')
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

  async findAllByUserId(
    id: string,
    current: number,
    pageSize: number,
    qs: string,
  ) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const limitDefault = pageSize ? pageSize : 10;
    const totalItems = await this.courseModel.countDocuments({
      ...filter,
      'createBy._id': id,
    });
    const totalPage = Math.ceil(totalItems / limitDefault);
    const offset = pageSize * (current - 1);

    const result = await this.courseModel
      .find({
        ...filter,
        'createBy._id': id,
      })
      .skip(offset)
      .limit(limitDefault)
      .sort(sort as any)
      .select(projection)
      .populate('categoryId', 'name')
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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    return this.courseModel.findOne({ _id: id });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    return await this.courseModel.updateOne(
      { _id: id },
      {
        ...updateCourseDto,
        updateBy: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      },
    );
  }

  remove(id: string) {
    return this.courseModel.softDelete({ _id: id });
  }
}
