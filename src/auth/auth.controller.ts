/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('v1/auth')
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
    @Headers() header: Record<string, string | string[] | undefined>,
    @Body() dto: RegisterDto,
  ) {
    const tenantId = this.gettenantid(header);
    return this.authService.register(
      tenantId,
      dto.email,
      dto.password,
      dto.username,
    );
  }
  @Post('login')
  login(
    @Headers() header: Record<string, string | string[] | undefined>,
    @Body() dto: LoginDto,
  ) {
    const tenantId = this.gettenantid(header);
    return this.authService.login(tenantId, dto.email, dto.password);
  }
  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }

    return this.authService.refreshToken(body.refreshToken);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Get()
  hello(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return req.user;
  }
}
