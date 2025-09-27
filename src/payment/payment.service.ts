import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Model } from 'mongoose';
import {
  Enrollment,
  EnrollmentDocument,
} from 'src/enrollments/schemas/enrollment.schema';
import * as qs from 'qs';
import * as crypto from 'crypto';
import moment from 'moment';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
  ) {}
  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: string) {
    return this.paymentModel.findOne({ _id: id });
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  async createPayment(
    userId: string,
    courseId: string,
    amount: number,
    ipAddr: string,
  ) {
    // Tạo enrollment
    const enrollment = await this.enrollmentModel.create({
      user_id: userId,
      course_id: courseId,
      status: 'pending',
    });

    // Tạo payment
    const payment = await this.paymentModel.create({
      enrollment_id: enrollment._id,
      totalPrice: amount,
      status: 'pending',
    });

    // Tạo thời gian & TxnRef
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId =
      moment(date).format('DDHHmmss') + payment._id.toString().slice(-6);

    const vnp_HashSecret = this.configService.get<string>('VNP_HASHSECRET');
    const vnp_TmnCode = this.configService.get<string>('VNP_TMNCODE');
    const vnp_ReturnUrl = this.configService.get<string>('VNP_RETURNURL');
    const vnp_Url = this.configService.get<string>('VNP_URL');

    // Params VNPAY
    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `Thanh_toan_khoa_hoc_${courseId}`;
    vnp_Params['vnp_OrderType'] = 'billpayment';
    vnp_Params['vnp_Amount'] = Math.round(amount) * 100;
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr === '::1' ? '127.0.0.1' : ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    // Sort params
    vnp_Params = this.sortObject(vnp_Params);

    // Chuỗi để ký (phải encode)
    const signData = qs.stringify(vnp_Params, { encode: true });

    // Ký HMAC SHA512
    const signed = crypto
      .createHmac('sha512', vnp_HashSecret!)
      .update(signData, 'utf-8')
      .digest('hex');

    // Gắn SecureHash
    vnp_Params['vnp_SecureHash'] = signed;

    // Build URL cuối (encode = true để trùng VNPAY)
    const paymentUrl =
      vnp_Url + '?' + qs.stringify(vnp_Params, { encode: true });

    // console.log('SignData:', signData);
    // console.log('Signed:', signed);
    // console.log('Final URL:', paymentUrl);

    return { paymentUrl, paymentId: payment._id };
  }

  private sortObject(obj: any) {
    const sorted: any = {};
    const str = Object.keys(obj).sort();
    str.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }
}
