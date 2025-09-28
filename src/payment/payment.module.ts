import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    forwardRef(() => EnrollmentsModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [MongooseModule, PaymentService],
})
export class PaymentModule {}
