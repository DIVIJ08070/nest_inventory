import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart.item';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { InventoryMovement } from 'src/orders/entities/inventory-movement.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import type { AuthedUser } from 'src/Common/types/authed-user';

@Injectable()
export class CartsService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(InventoryMovement)
    private readonly inventoryRepo: Repository<InventoryMovement>,
  ) {}

  private async getOrCreateCart(user: AuthedUser) {
    let cart = await this.cartRepo.findOne({
      where: {
        tenant_id: user.tenant_id,
        customer_id: user.user_id,
        status: 1,
      },
    });

    if (!cart) {
      cart = this.cartRepo.create({
        tenant_id: user.tenant_id,
        customer_id: user.user_id,
        status: 1,
      });

      cart = await this.cartRepo.save(cart);
    }

    return cart;
  }

  async addToCart(user: AuthedUser, dto: CreateCartDto) {
    const product = await this.productRepo.findOne({
      where: {
        product_id: dto.product_id,
        tenant_id: user.tenant_id,
        status: 1,
      },
    });

    if (!product) {
      throw new NotFoundException('product not found');
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException('not enough stock');
    }

    const cart = await this.getOrCreateCart(user);

    const existingItem = await this.cartItemRepo.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id: dto.product_id,
        status: 1,
      },
    });

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      return this.cartItemRepo.save(existingItem);
    }

    const item = this.cartItemRepo.create({
      cart_id: cart.cart_id,
      product_id: dto.product_id,
      quantity: dto.quantity,
      status: 1,
    });

    return this.cartItemRepo.save(item);
  }

  async getMyCart(user: AuthedUser) {
    const cart = await this.cartRepo.findOne({
      where: {
        tenant_id: user.tenant_id,
        customer_id: user.user_id,
        status: 1,
      },
    });

    if (!cart) {
      return [];
    }

    return this.cartItemRepo.find({
      where: {
        cart_id: cart.cart_id,
        status: 1,
      },
      order: { cart_item_id: 'DESC' },
    });
  }

  async updateCartItem(user: AuthedUser, itemId: number, dto: UpdateCartDto) {
    const cart = await this.getOrCreateCart(user);

    const item = await this.cartItemRepo.findOne({
      where: {
        cart_item_id: itemId,
        cart_id: cart.cart_id,
        status: 1,
      },
    });

    if (!item) {
      throw new NotFoundException('cart item not found');
    }

    item.quantity = dto.quantity;
    return this.cartItemRepo.save(item);
  }

  async removeCartItem(user: AuthedUser, itemId: number) {
    const cart = await this.getOrCreateCart(user);

    const item = await this.cartItemRepo.findOne({
      where: {
        cart_item_id: itemId,
        cart_id: cart.cart_id,
        status: 1,
      },
    });

    if (!item) {
      throw new NotFoundException('cart item not found');
    }

    item.status = 0;
    return this.cartItemRepo.save(item);
  }

  async checkout(user: AuthedUser) {
    const cart = await this.cartRepo.findOne({
      where: {
        tenant_id: user.tenant_id,
        customer_id: user.user_id,
        status: 1,
      },
    });

    if (!cart) {
      throw new BadRequestException('cart not found');
    }

    const cartItems = await this.cartItemRepo.find({
      where: {
        cart_id: cart.cart_id,
        status: 1,
      },
      order: { cart_item_id: 'ASC' },
    });

    if (!cartItems.length) {
      throw new BadRequestException('cart is empty');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;

      const order = queryRunner.manager.create(Order, {
        tenant_id: user.tenant_id,
        customer_id: user.user_id,
        order_status: 'pending',
        subtotal_amount: '0.00',
        tax_amount: '0.00',
        discount_amount: '0.00',
        shipping_amount: '0.00',
        grand_total: '0.00',
        status: 1,
      });

      await queryRunner.manager.save(order);

      for (const cartItem of cartItems) {
        const product = await queryRunner.manager.findOne(Product, {
          where: {
            product_id: cartItem.product_id,
            tenant_id: user.tenant_id,
            status: 1,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(
            `product not found: ${cartItem.product_id}`,
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `not enough stock for product ${cartItem.product_id}`,
          );
        }

        const unitPrice = Number(product.price);
        const lineSubtotal = unitPrice * cartItem.quantity;

        subtotal += lineSubtotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          order_id: order.order_id,
          product_id: product.product_id,
          quantity: cartItem.quantity,
          unit_price: unitPrice.toFixed(2),
          line_subtotal: lineSubtotal.toFixed(2),
          line_total: lineSubtotal.toFixed(2),
          status: 1,
        });

        await queryRunner.manager.save(orderItem);

        product.stock -= cartItem.quantity;
        await queryRunner.manager.save(product);

        const movement = queryRunner.manager.create(InventoryMovement, {
          tenant_id: user.tenant_id,
          product_id: product.product_id,
          order_id: order.order_id,
          type: 'order',
          quantity: cartItem.quantity,
          note: 'stock deducted from cart checkout',
          status: 1,
        });

        await queryRunner.manager.save(movement);

        cartItem.status = 0;
        await queryRunner.manager.save(cartItem);
      }

      order.subtotal_amount = subtotal.toFixed(2);
      order.grand_total = subtotal.toFixed(2);
      await queryRunner.manager.save(order);

      cart.status = 0;
      await queryRunner.manager.save(cart);

      await queryRunner.commitTransaction();

      return {
        message: 'checkout successful',
        order,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
