import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'Category name',
  })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'All electronic products like phones, laptops, etc.',
    description: 'Category description',
  })
  @IsOptional()
  description?: string;
}
