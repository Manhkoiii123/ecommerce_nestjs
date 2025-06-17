import { Injectable } from '@nestjs/common';
import {
  CreateOrderBodyType,
  GetOrderListResType,
} from 'src/routes/order/order.model';
import { OrderRepo } from 'src/routes/order/order.repo';
import { OrderStatusType } from 'src/shared/constants/order.constants';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepo: OrderRepo) {}
  async list({
    userId,
    limit,
    page,
    status,
  }: {
    userId: number;
    limit: number;
    page: number;
    status?: OrderStatusType;
  }): Promise<GetOrderListResType> {
    return this.orderRepo.list({ userId, limit, page, status });
  }
  async create(userId: number, body: CreateOrderBodyType) {
    return this.orderRepo.create(userId, body);
  }
}
