import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Category ID of the product',
  })
  @IsOptional()
  @IsInt()
  category_id?: number;

  @ApiProperty({
    example: 'iPhone 15',
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Latest Apple smartphone',
    description: 'Product description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price',
  })
  @IsPositive()
  price: number;

  @ApiProperty({
    example: 10,
    default: 0,
    description: 'Available stock quantity',
  })
  @IsInt()
  @Min(0)
  stock: number;
}
