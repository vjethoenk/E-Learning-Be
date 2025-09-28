import { Module, forwardRef } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    forwardRef(() => PaymentModule),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [MongooseModule, EnrollmentsService],
})
export class EnrollmentsModule {}
