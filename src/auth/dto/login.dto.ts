import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'parth@gmail.com' })
  email: string;

  @ApiProperty({ example: '123456' })
  password: string;
}
