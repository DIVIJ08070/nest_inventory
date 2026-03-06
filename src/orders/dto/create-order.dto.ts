import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min } from 'class-validator';

class OrderItemDto {
  @ApiProperty({
    example: 1,
    description: 'Product ID',
  })
  @IsInt()
  product_id: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of product',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    example: [
      {
        product_id: 1,
        quantity: 2,
      },
    ],
  })
  @IsArray()
  items: OrderItemDto[];
}
