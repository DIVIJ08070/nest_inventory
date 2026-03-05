import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateVendorDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
