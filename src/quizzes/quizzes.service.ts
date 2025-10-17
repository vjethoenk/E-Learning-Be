import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { Model } from 'mongoose';
import he from 'he';
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

  async findAllQuestions(id: string) {
    const questions = await this.questionModel.find({ quiz_id: id });
    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answers = await this.answerModel
          .find({ question_id: q._id })
          .sort({ order: 1 });

        return {
          ...q.toObject(),
          answers,
        };
      }),
    );

    return questionsWithAnswers;
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
    const quizzes = await this.quizModel.find({ section_id: sectionId });

    if (!quizzes || quizzes.length === 0) return [];

    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions = await this.questionModel.find({
          quiz_id: quiz._id.toString(),
        });

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
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) return null;

    const questions = await this.questionModel.find({
      quiz_id: quiz._id.toString(),
    });

    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answers = await this.answerModel
          .find({ question_id: q._id })
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
  }



// ...

async importFromWord(chapterId: string, text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const titleLine = lines.find((l) => l.startsWith('# Quiz:'));
  const quizTitle =
    titleLine?.replace('# Quiz:', '').trim() ?? 'Untitled Quiz';

  const quiz = await this.quizModel.create({
    section_id: chapterId,
    title: quizTitle,
  });

  let currentQuestion: string | null = null;
  let answersBuffer: { answerText: string; isCorrect: boolean }[] = [];

  for (const line of lines) {
    if (/^Q\d+\./.test(line)) {
      if (currentQuestion) {
        await this.saveQuestion(
          quiz._id.toString(),
          currentQuestion,
          answersBuffer,
        );
      }
      currentQuestion = line.replace(/^Q\d+\.\s*/, '').trim();
      answersBuffer = [];
    }

    else if (/^[A-D]\./.test(line)) {
      const isCorrect = line.includes('✅');
      const rawAnswer = line
        .replace(/^[A-D]\.\s*/, '')
        .replace(/✅/g, '')
        .trim();

      const answerText = he.decode(rawAnswer);

      if (answerText.length > 0) {
        answersBuffer.push({
          answerText,
          isCorrect,
        });
      }
    }
  }

  if (currentQuestion) {
    await this.saveQuestion(
      quiz._id.toString(),
      currentQuestion,
      answersBuffer,
    );
  }

  return { message: 'Import completed', quizId: quiz._id };
}

private async saveQuestion(quizId: string, text: string, answers: any[]) {
  console.log('💬 Saving question:', text);
  console.log('📌 Answers:', answers);

  const question = await this.questionModel.create({
    quiz_id: quizId,
    questionText: text,
  });

  for (let i = 0; i < answers.length; i++) {
    await this.answerModel.create({
      question_id: question._id,
      answerText: answers[i].answerText,
      order: i + 1,
      isCorrect: answers[i].isCorrect,
    });
  }
}

}
