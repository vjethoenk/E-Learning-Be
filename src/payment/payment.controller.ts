import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Request } from 'express';
import { Public } from 'src/decorator/customize';
import { Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('vnpay-return')
  @Public()
  async vnpayReturn(
    @Query() query: any,
    @Res() res: Response, // bỏ passthrough
  ) {
    if (
      query.vnp_ResponseCode === '00' &&
      query.vnp_TransactionStatus === '00'
    ) {
      res.redirect(
        `http://localhost:5173/payment/success?paymentId=${query.vnp_TxnRef}`,
      );
    } else {
      res.redirect(
        `http://localhost:5173/payment/fail?paymentId=${query.vnp_TxnRef}`,
      );
    }
  }

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
  @Post('create')
  async createPayment(
    @Body() body: { userId: string; courseId: string; amount: number },
    @Req() req: Request,
  ) {
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    return this.paymentService.createPayment(
      body.userId,
      body.courseId,
      body.amount,
      String(ipAddr),
    );
  }
}
