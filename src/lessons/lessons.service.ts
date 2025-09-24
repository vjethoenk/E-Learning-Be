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
    // const result = await this.youtubeService.uploadVideo(
    //   file.path,
    //   createLessonDto.title,
    //   createLessonDto.description || '',
    //   'unlisted',
    //   process.env.GOOGLE_REDIRECT_URI,
    // );

    const lesson = await this.lessonModel.create({
      ...createLessonDto,
      // videoId: result.videoId,
      // duration: result.duration || 0,
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

  update(id: number, updateLessonDto: UpdateLessonDto) {
    return `This action updates a #${id} lesson`;
  }

  remove(id: number) {
    return `This action removes a #${id} lesson`;
  }
}
