import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  CancelOrderResDTO,
  CreateOrderBodyDTO,
  CreateOrderResDTO,
  GetOrderDetailResDTO,
  GetOrderListResDTO,
  GetOrderParamsDTO,
} from 'src/routes/order/order.dto';
import { OrderService } from 'src/routes/order/order.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { AccessTokenGuard } from 'src/shared/guards/accessToken.guard';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';

@Controller('orders')
@UseGuards(AccessTokenGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Get()
  @UseGuards(AuthenticationGuard)
  @ZodSerializerDto(GetOrderListResDTO)
  getOrder(
    @ActiveUser('userId') userId: number,
    @Query() query: GetOrderListResDTO,
  ) {
    return this.orderService.list({ userId, ...query });
  }
  @Post()
  @UseGuards(AuthenticationGuard)
  @ZodSerializerDto(CreateOrderResDTO)
  create(
    @ActiveUser('userId') userId: number,
    @Body() body: CreateOrderBodyDTO,
  ) {
    return this.orderService.create(userId, body);
  }

  @Get(':orderId')
  @ZodSerializerDto(GetOrderDetailResDTO)
  @UseGuards(AuthenticationGuard)
  getDetail(
    @ActiveUser('userId') userId: number,
    @Param() param: GetOrderParamsDTO,
  ) {
    return this.orderService.detail(userId, param.orderId);
  }

  @Put(':orderId/cancel')
  @ZodSerializerDto(CancelOrderResDTO)
  @UseGuards(AuthenticationGuard)
  cancel(
    @ActiveUser('userId') userId: number,
    @Param() param: GetOrderParamsDTO,
  ) {
    return this.orderService.cancel(userId, param.orderId);
  }
}
