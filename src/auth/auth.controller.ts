/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  auth: any;
  constructor(private readonly authService: AuthService) {}

  private gettenantid(header: Record<string, string | string[] | undefined>) {
    const val = header['x-tenant-id'];
    const tenant_id = Number(Array.isArray(val) ? val[0] : val);
    return tenant_id;
  }

  @Post('register')
  register(
    header: Record<string, string | string[] | undefined>,
    @Body() dto: RegisterDto,
  ) {
    const tenantId = this.gettenantid(header);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.auth.register(tenantId, dto);
  }
}
