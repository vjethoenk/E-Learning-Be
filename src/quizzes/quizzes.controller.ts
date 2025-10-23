import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as mammoth from 'mammoth';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('section/:sectionId')
  @Public()
  async getQuizBySection(@Param('sectionId') sectionId: string) {
    return this.quizzesService.getQuizBySection(sectionId);
  }
  @Post(':sectionId')
  @Public()
  async createQuiz(
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateQuizDto,
  ) {
    return this.quizzesService.createQuiz(sectionId, dto.title);
  }
  @Post()
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }

  @Get(':id')
  @Public()
  findAll(@Param('id') id: string) {
    return this.quizzesService.findAll(id);
  }
  @Get('ques/:quizId')
  @Public()
  @ResponseMessage('Fetch a quiz')
  async getQuiz(@Param('quizId') quizId: string) {
    const quiz = await this.quizzesService.getQuizById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  @Get('questions/:id')
  @Public()
  findAllQuestions(@Param('id') id: string) {
    return this.quizzesService.findAllQuestions(id);
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.quizzesService.findOne(id);
  // }

  @Patch(':quizId')
@Public()
async updateQuiz(
  @Param('quizId') quizId: string,
  @Body() dto: UpdateQuizDto,
) {
  return this.quizzesService.updateQuiz(quizId, dto);
}

@Delete(':quizId')
@Public()
async deleteQuiz(@Param('quizId') quizId: string) {
  return this.quizzesService.deleteQuiz(quizId);
  }
  @Patch('questions/:questionId')
@Public()
async updateQuestion(
  @Param('questionId') questionId: string,
  @Body() dto: UpdateQuestionDto,
) {
  return this.quizzesService.updateQuestion(questionId, dto);
}

@Delete('questions/:questionId')
@Public()
async deleteQuestion(@Param('questionId') questionId: string) {
  return this.quizzesService.deleteQuestion(questionId);
}

  @Post(':quizId/questions')
  @Public()
  async addQuestion(
    @Param('quizId') quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizzesService.addQuestion(quizId, dto.questionText);
  }

  @Post('questions/:questionId/answers')
  @Public()
  async addAnswer(
    @Param('questionId') questionId: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.quizzesService.addAnswer(
      questionId,
      dto.answerText,
      dto.order,
      dto.isCorrect,
    );
  }
  @Post('import/:chapterId')
@Public()
@UseInterceptors(FileInterceptor('file'))
async importQuizFromWord(
  @Param('chapterId') chapterId: string,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new NotFoundException('No file uploaded');
  }

  const result = await mammoth.extractRawText({ buffer: file.buffer });
  const text = result.value;

  return this.quizzesService.importFromWord(chapterId, text);
}
}
