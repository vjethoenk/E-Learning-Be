import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizAnswerDocument = HydratedDocument<QuizAnswer>;

@Schema({ timestamps: true })
export class QuizAnswer {
  @Prop({ type: Types.ObjectId, ref: 'QuizQuestion', required: true })
  question_id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  answerText: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Boolean, default: false })
  isCorrect: boolean;
}

export const QuizAnswerSchema = SchemaFactory.createForClass(QuizAnswer);
