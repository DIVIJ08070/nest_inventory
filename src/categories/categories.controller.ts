import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

import type { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

type AuthedReq = Request & {
  user: {
    user_id: number;
    tenant_id: number;
    role: 'admin' | 'vendor' | 'customer';
  };
};

@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: AuthedReq) {
    return this.categories.findAll(req.user.tenant_id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Req() req: AuthedReq, @Body() dto: CreateCategoryDto) {
    return this.categories.create(req.user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Req() req: AuthedReq,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categories.update(req.user, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Req() req: AuthedReq, @Param('id', ParseIntPipe) id: number) {
    return this.categories.remove(req.user, id);
  }
}
