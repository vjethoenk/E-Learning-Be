import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type QuizQuestionDocument = HydratedDocument<QuizQuestion>;

@Schema({ timestamps: true })
export class QuizQuestion {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quiz_id: Types.ObjectId;

  @Prop({ required: true })
  questionText: string;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);
