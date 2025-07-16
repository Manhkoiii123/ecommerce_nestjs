import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'date-fns';
import { OrderIncludeProductSKUSnapshotType } from 'src/routes/order/order.model';
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model';
import { OrderStatus } from 'src/shared/constants/order.constants';
import { PREFIX_PAYMENT_CODE } from 'src/shared/constants/other.constant';
import { PaymentStatus } from 'src/shared/constants/payment.constant';
import { MessageRes } from 'src/shared/models/response.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}
  private getTotalPrice(orders: OrderIncludeProductSKUSnapshotType[]): number {
    return orders.reduce((total, order) => {
      const orderTotal = order.items.reduce(
        (sum, item) => sum + item.skuPrice * item.quantity,
        0,
      );
      return total + orderTotal;
    }, 0);
  }
  async receiver(body: WebhookPaymentBodyType): Promise<MessageRes> {
    let amountIn = 0;
    let amountOut = 0;
    if (body.transferType === 'in') {
      amountIn = body.transferAmount;
    } else if (body.transferType === 'out') {
      amountOut = body.transferAmount;
    }
    await this.prismaService.paymentTransaction.create({
      data: {
        gateWay: body.gateway,
        transactionDate: parse(
          body.transactionDate,
          'yyyy-MM-dd HH:mm:ss',
          new Date(),
        ),
        accountNumber: body.accountNumber,
        subAccount: body.subAccount,
        amountIn,
        amountOut,
        accumulated: body.accumulated,
        code: body.code,
        transactionContent: body.content,
        referenceNumber: body.referenceCode,
        body: body.description,
      },
    });
    // kiểm tra nội dung chuyển khoản + tổng tiền có khớp ko
    const paymentId = body.code
      ? Number(body.code.split(PREFIX_PAYMENT_CODE)[1])
      : Number(body.content?.split(PREFIX_PAYMENT_CODE)[1]);
    if (isNaN(paymentId)) {
      throw new BadRequestException('Cannot get paymentId from content');
    }
    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId },
      include: {
        orders: {
          include: {
            items: true,
          },
        },
      },
    });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    const { orders } = payment;
    const totalPrice = this.getTotalPrice(orders);
    if (totalPrice !== body.transferAmount) {
      throw new BadRequestException('Total price not match');
    }
    // cập nhật trạng thái thanh toán
    await this.prismaService.$transaction([
      this.prismaService.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.SUCCESS },
      }),
      // cập nhật trạng thái đơn hàng
      this.prismaService.order.updateMany({
        where: {
          id: {
            in: orders.map((order) => order.id),
          },
        },
        data: { status: OrderStatus.PENDING_PICKUP },
      }),
    ]);
    return {
      message: 'Payment successful',
    };
  }
}
