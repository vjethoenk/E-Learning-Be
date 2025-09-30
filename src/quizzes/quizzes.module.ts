import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import {
  QuizQuestion,
  QuizQuestionSchema,
} from './schemas/quiz-question.schema';
import { QuizAnswer, QuizAnswerSchema } from './schemas/quiz-answer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizQuestion.name, schema: QuizQuestionSchema },
      { name: QuizAnswer.name, schema: QuizAnswerSchema },
    ]),
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
