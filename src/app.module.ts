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
import { QueueModule } from './queue/queue.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './reports/reports.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ReportsModule,
    ScheduleModule.forRoot(),
    QueueModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 5,
      },
    ]),
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
        Category,
      ],
      synchronize: false,
    }),
    AuthModule,
    UserModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
