import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { YoutubeService } from 'src/youtube/youtube.service';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private lessonModel: SoftDeleteModel<LessonDocument>,
    private youtubeService: YoutubeService,
  ) {}
  async create(
    createLessonDto: CreateLessonDto,
    file: Express.Multer.File,
    user: IUser,
  ) {
    const lesson = await this.lessonModel.create({
      ...createLessonDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return lesson;
  }

  async findAll(id: string, current: number, pageSize: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const limitDefault = pageSize ? pageSize : 10;
    const totalItems = await this.lessonModel.countDocuments({
      ...filter,
      sectionId: id,
      isDeleted: false,
    });
    const totalPage = Math.ceil(totalItems / limitDefault);
    const offset = pageSize * (current - 1);

    const result = await this.lessonModel
      .find({
        ...filter,
        sectionId: id,
      })
      .skip(offset)
      .limit(limitDefault)
      .sort(sort as any)
      .select(projection)
      .populate('sectionId', 'title')
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
      throw new BadRequestException('Invalid id');
    }
    return this.lessonModel.findOne({ _id: id });
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const lesson = await this.lessonModel.findById(id);
    if (!lesson) {
      throw new BadRequestException('Lesson not found');
    }

    if (lesson.videoId) {
      await this.youtubeService.updateVideo(lesson.videoId, {
        title: updateLessonDto.title,
        description: updateLessonDto.description,
      });
    }

    return this.lessonModel.updateOne(
      { _id: id },
      {
        ...updateLessonDto,
        updateBy: { _id: user._id, email: user.email },
      },
    );
  }
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const lesson = await this.lessonModel.findOne({ _id: id });
    if (!lesson) {
      throw new BadRequestException('Lesson not found');
    }

    if (lesson.videoId) {
      await this.youtubeService.deleteVideo(lesson.videoId);
    }

    return this.lessonModel.softDelete({ _id: id });
  }
}
