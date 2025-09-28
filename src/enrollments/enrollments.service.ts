import { Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from 'src/payment/schemas/payment.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}
  async create(createEnrollmentDto: CreateEnrollmentDto, user: IUser) {
    return await this.enrollmentModel.create({
      ...createEnrollmentDto,
      createBy: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  }

  findAll() {
    return `This action returns all enrollments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enrollment`;
  }

  update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return `This action updates a #${id} enrollment`;
  }

  remove(id: number) {
    return `This action removes a #${id} enrollment`;
  }

  async checkEnrollment(userId: string, courseId: string) {
    const enrollment = await this.enrollmentModel.findOne({
      user_id: userId,
      course_id: courseId,
    });

    if (!enrollment) {
      return { isEnrolled: false, message: 'User chưa đăng ký khóa học này' };
    }

    const payment = await this.paymentModel.findOne({
      enrollment_id: enrollment._id,
    });

    return {
      isEnrolled: true,
      enrollment,
      payment: payment || null,
    };
  }
}
