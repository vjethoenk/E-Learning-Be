import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { Model, Types } from 'mongoose';
import {
  QuizQuestion,
  QuizQuestionDocument,
} from './schemas/quiz-question.schema';
import { QuizAnswer, QuizAnswerDocument } from './schemas/quiz-answer.schema';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(QuizQuestion.name)
    private questionModel: Model<QuizQuestionDocument>,
    @InjectModel(QuizAnswer.name)
    private answerModel: Model<QuizAnswerDocument>,
  ) {}
  create(createQuizDto: CreateQuizDto) {
    return 'This action adds a new quiz';
  }

  findAll(id: string) {
    return this.quizModel.find({ section_id: id });
  }
  findAllQuestions(id: string) {
    return this.questionModel.find({ quiz_id: id });
  }

  findOne(id: string) {
    return `This action returns a #${id} quiz`;
  }

  update(id: number, updateQuizDto: UpdateQuizDto) {
    return `This action updates a #${id} quiz`;
  }

  remove(id: number) {
    return `This action removes a #${id} quiz`;
  }
  async createQuiz(sectionId: string, title: string) {
    return this.quizModel.create({ section_id: sectionId, title });
  }

  async addQuestion(quizId: string, questionText: string) {
    return this.questionModel.create({ quiz_id: quizId, questionText });
  }

  async addAnswer(
    questionId: string,
    answerText: string,
    order: number,
    isCorrect: boolean,
  ) {
    return this.answerModel.create({
      question_id: questionId,
      answerText,
      order,
      isCorrect,
    });
  }

  async getQuizBySection(sectionId: string) {
    // Lấy tất cả quiz theo section
    const quizzes = await this.quizModel.find({ section_id: sectionId });

    if (!quizzes || quizzes.length === 0) return [];

    // Map từng quiz
    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        // Lấy tất cả câu hỏi theo quizId
        const questions = await this.questionModel.find({
          quiz_id: quiz._id.toString(),
        });

        // Map từng câu hỏi -> lấy answers
        const questionsWithAnswers = await Promise.all(
          questions.map(async (q) => {
            const answers = await this.answerModel
              .find({ question_id: q._id.toString() })
              .sort({ order: 1 });

            return {
              ...q.toObject(),
              answers,
            };
          }),
        );

        return {
          ...quiz.toObject(),
          questions: questionsWithAnswers,
        };
      }),
    );

    return quizzesWithQuestions;
  }
  async getQuizById(quizId: string) {
    // 1. Lấy quiz theo id
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) return null;

    // 2. Lấy danh sách câu hỏi của quiz
    const questions = await this.questionModel.find({
      quiz_id: quiz._id.toString(),
    });

    // 3. Với mỗi câu hỏi -> lấy answers
    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answers = await this.answerModel
          .find({ question_id: q._id.toString() })
          .sort({ order: 1 });

        return {
          ...q.toObject(),
          answers,
        };
      }),
    );

    // 4. Trả về kết quả
    return {
      ...quiz.toObject(),
      questions: questionsWithAnswers,
    };
  }
}
