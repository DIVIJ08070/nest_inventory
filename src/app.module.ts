import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { RefreshToken } from './auth/refresh-token.entity';
import { Tenant } from './auth/tenant.entity';
import { ProductsModule } from './products/products.module';
import { Category } from './products/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { ProductImage } from './products/entities/product-image.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { InventoryMovement } from './orders/entities/inventory-movement.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    CacheModule.register({
      ttl: 60,
      isGlobal: true,
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.db_host,
      port: Number(process.env.db_port),
      username: process.env.db_user,
      password: process.env.db_pass,
      database: process.env.db_name,
      entities: [
        User,
        RefreshToken,
        Tenant,
        Category,
        Product,
        ProductImage,
        Order,
        OrderItem,
        InventoryMovement,
      ],
      synchronize: false,
    }),
    AuthModule,
    UserModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
