import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt()
  product_id: number;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsInt()
  @Min(1)
  quantity: number;
}
