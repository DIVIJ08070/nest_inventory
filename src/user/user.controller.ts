import {
  Controller,
  Patch,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

type AuthedReq = Request & {
  user: {
    user_id: number;
    tenant_id: number;
    role: 'admin' | 'vendor' | 'customer';
  };
};

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/make-vendor')
  makeVendor(@Req() req: AuthedReq, @Param('id', ParseIntPipe) id: number) {
    return this.users.makeVendor(id, req.user.tenant_id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/make-admin')
  makeAdmin(@Req() req: AuthedReq, @Param('id', ParseIntPipe) id: number) {
    return this.users.makeAdmin(id, req.user.tenant_id);
  }
}
