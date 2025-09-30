import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type QuizAnswerDocument = HydratedDocument<QuizAnswer>;

@Schema({ timestamps: true })
export class QuizAnswer {
  @Prop({ type: Types.ObjectId, ref: 'QuizQuestion', required: true })
  question_id: Types.ObjectId;

  @Prop({ required: true })
  answerText: string;

  @Prop()
  order: number;

  @Prop({ default: false })
  isCorrect: boolean;
}

export const QuizAnswerSchema = SchemaFactory.createForClass(QuizAnswer);
