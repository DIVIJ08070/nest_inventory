import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

type AuthedReq = Request & {
  user: {
    user_id: number;
    tenant_id: number;
    role: 'admin' | 'vendor' | 'customer';
  };
};

@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'category', required: false, type: Number })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Req() req: AuthedReq,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
  ) {
    return this.products.findAll(req.user.tenant_id, {
      category: category ? Number(category) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req: AuthedReq, @Param('id', ParseIntPipe) id: number) {
    return this.products.findOne(req.user.tenant_id, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @Post()
  create(@Req() req: AuthedReq, @Body() dto: CreateProductDto) {
    return this.products.create(req.user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @Patch(':id')
  update(
    @Req() req: AuthedReq,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(req.user, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @Delete(':id')
  remove(@Req() req: AuthedReq, @Param('id', ParseIntPipe) id: number) {
    return this.products.remove(req.user, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @Post(':id/images')
  @ApiOperation({ summary: 'Upload product image' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        primary: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok =
          file.mimetype === 'image/jpeg' || file.mimetype === 'image/png';
        cb(ok ? null : new Error('only jpg/png allowed'), ok);
      },
    }),
  )
  uploadImage(
    @Req() req: AuthedReq,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Query('primary') primary?: string,
  ) {
    const isPrimary = primary === 'true' ? 1 : 0;
    const url = `/uploads/products/${file.filename}`;
    return this.products.addImage(req.user, id, url, isPrimary);
  }
}
