import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ example: 3, description: 'Updated quantity' })
  @IsInt()
  @Min(1)
  quantity: number;
}
