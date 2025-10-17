import { Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { IUser } from 'src/users/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from 'src/payment/schemas/payment.schema';
import { Course, CourseDocument } from 'src/courses/schemas/course.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
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

  async getStudentsByTeacher(teacherId: string) {
    //Lấy danh sách khóa học của giáo viên
    const teacherCourses = await this.courseModel
      .find({ 'createBy._id': teacherId })
      .select('_id');

    const courseIds = teacherCourses.map((c) => c._id);

    //Lọc danh sách học viên đăng ký những khóa này
    const enrollments = await this.enrollmentModel
      .find({
        course_id: { $in: courseIds.map((id) => id.toString()) },
      })
      .populate('user_id', 'name email')
      .populate('course_id', 'title');

    const firstEnrollment = await this.enrollmentModel.findOne();
    const uniqueStudents: { user: any; courses: string[] }[] = [];
    const seen = new Set<string>();
    for (const e of enrollments) {
      const id = e.user_id._id.toString();
      if (!seen.has(id)) {
        seen.add(id);

        uniqueStudents.push({
          user: e.user_id,
          courses: enrollments
            .filter((x) => x.user_id._id.toString() === id)
            .map((x) => (x.course_id as any).title),
        });
      }
    }

    return uniqueStudents;
  }

  async getStatistics() {
    //Tổng số lượt đăng ký
    const totalEnrollments = await this.enrollmentModel.countDocuments();
    console.log('totalEnrollments:', totalEnrollments);
    //Tổng số giao dịch
    const totalPayments = await this.paymentModel.countDocuments();

    //Tổng doanh thu (chỉ tính các payment có status = 'success')
    const totalRevenueAgg = await this.paymentModel.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    //Số giao dịch đang chờ
    const pendingPayments = await this.paymentModel.countDocuments({
      status: 'pending',
    });

    //Top 5 khóa học được đăng ký nhiều nhất
    const topCourses = await this.enrollmentModel.aggregate([
      { $group: { _id: '$course_id', totalStudents: { $sum: 1 } } },
      { $sort: { totalStudents: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $project: {
          _id: 0,
          courseId: '$course._id',
          title: '$course.title',
          totalStudents: 1,
        },
      },
    ]);

    // Doanh thu theo từng tháng (12 tháng)
    const monthlyRevenue = await this.paymentModel.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: { $month: { $toDate: '$createdAt' } },
          total: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      totalEnrollments,
      totalPayments,
      totalRevenue,
      pendingPayments,
      topCourses,
      monthlyRevenue,
    };
  }
}
