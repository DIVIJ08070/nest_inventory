import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthedUser } from 'src/Common/types/authed-user';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('Carts')
@ApiBearerAuth()
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  addToCart(@CurrentUser() user: AuthedUser, @Body() dto: CreateCartDto) {
    return this.cartsService.addToCart(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get my cart' })
  @ApiResponse({ status: 200, description: 'Cart items fetched successfully' })
  getMyCart(@CurrentUser() user: AuthedUser) {
    return this.cartsService.getMyCart(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateCartDto })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  updateCartItem(
    @CurrentUser() user: AuthedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartsService.updateCartItem(user, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Cart item removed' })
  removeCartItem(
    @CurrentUser() user: AuthedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartsService.removeCartItem(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  @ApiOperation({ summary: 'Checkout cart and create order' })
  @ApiResponse({ status: 201, description: 'Checkout completed successfully' })
  checkout(@CurrentUser() user: AuthedUser) {
    return this.cartsService.checkout(user);
  }
}
