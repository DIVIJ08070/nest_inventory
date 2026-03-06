import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiHeader,
  ApiResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private gettenantid(header: Record<string, string | string[] | undefined>) {
    const val = header['x-tenant-id'];
    const tenant_id = Number(Array.isArray(val) ? val[0] : val);
    return tenant_id;
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiHeader({
    name: 'x-tenant-id',
    required: true,
    description: 'Tenant ID of the organization',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
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

  @ApiOperation({ summary: 'User login' })
  @ApiHeader({
    name: 'x-tenant-id',
    required: true,
    description: 'Tenant ID of the organization',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Returns accessToken and refreshToken',
  })
  @Throttle({ default: { limit: 3, ttl: 6000 } })
  @Post('login')
  login(
    @Headers() header: Record<string, string | string[] | undefined>,
    @Body() dto: LoginDto,
  ) {
    const tenantId = this.gettenantid(header);

    return this.authService.login(tenantId, dto.email, dto.password);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      example: {
        refreshToken: 'your_refresh_token_here',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns new accessToken and refreshToken',
  })
  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }

    return this.authService.refreshToken(body.refreshToken);
  }
  @Post('logout')
  logout(@Body() body: { refreshToken: string }) {
    return this.authService.logout(body.refreshToken);
  }
}
