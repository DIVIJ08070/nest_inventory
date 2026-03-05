import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthedUser } from 'src/Common/types/authed-user';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthedUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user, dto);
  }
}
