import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { YoutubeService } from 'src/youtube/youtube.service';

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

  findAll() {
    return `This action returns all lessons`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lesson`;
  }

  update(id: number, updateLessonDto: UpdateLessonDto) {
    return `This action updates a #${id} lesson`;
  }

  remove(id: number) {
    return `This action removes a #${id} lesson`;
  }
}
