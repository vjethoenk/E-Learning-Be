import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Enrollment', required: true })
  enrollment_id: Types.ObjectId;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ default: 'vnpay' })
  paymentMethod: string;

  @Prop({ default: 'pending' }) // pending | success | failed
  status: string;

  @Prop()
  paymentDate: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
