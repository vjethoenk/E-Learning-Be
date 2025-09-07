import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { YoutubeService } from 'src/youtube/youtube.service';
import { YoutubeModule } from 'src/youtube/youtube.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
    YoutubeModule,
  ],
  controllers: [LessonsController],
  providers: [LessonsService, YoutubeService],
  exports: [LessonsService],
})
export class LessonsModule {}
