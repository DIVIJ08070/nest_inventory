import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;
}
