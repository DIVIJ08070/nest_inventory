import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from './entities/product-image.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

type AuthedUser = {
  user_id: number;
  tenant_id: number;
  role: 'admin' | 'vendor' | 'customer';
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(user: AuthedUser, dto: CreateProductDto) {
    if (user.role !== 'admin' && user.role !== 'vendor') {
      throw new ForbiddenException('only vendor/admin can create products');
    }
    console.log(user.role);
    const product = this.repo.create({
      tenant_id: user.tenant_id,
      vendor_id: user.user_id,
      category_id: dto.category_id ?? null,
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      stock: dto.stock,
      status: 1,
    });
    console.log(product);
    await this.bumpTenantCacheVersion(user.tenant_id);
    return await this.repo.save(product);
  }
  async findAll(
    tenantId: number,
    query: {
      category?: number;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    },
  ) {
    const version = await this.getTenantCacheVersion(tenantId);
    const cacheKey = `products:list:v${version}:t${tenantId}:c${query.category ?? ''}:min${query.minPrice ?? ''}:max${query.maxPrice ?? ''}:s${query.search ?? ''}`;

    const cached = await this.cache.get<Product[]>(cacheKey);
    if (cached) return cached;
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.tenant_id = :tenantId', { tenantId })
      .andWhere('p.status = 1');

    if (query.category)
      qb.andWhere('p.category_id = :cid', { cid: query.category });
    if (query.minPrice !== undefined)
      qb.andWhere('p.price >= :minp', { minp: query.minPrice });
    if (query.maxPrice !== undefined)
      qb.andWhere('p.price <= :maxp', { maxp: query.maxPrice });

    if (query.search) {
      qb.andWhere('(p.name like :s or p.description like :s)', {
        s: `%${query.search}%`,
      });
    }

    qb.orderBy('p.product_id', 'DESC');

    const data = await qb.getMany();

    await this.cache.set(cacheKey, data, 60_000);

    return data;
  }

  async findOne(tenantId: number, productId: number) {
    const product = await this.repo.findOne({
      where: { tenant_id: tenantId, product_id: productId },
    });
    if (!product) throw new NotFoundException('product not found');
    return product;
  }

  async update(user: AuthedUser, productId: number, dto: UpdateProductDto) {
    const product = await this.findOne(user.tenant_id, productId);

    if (user.role !== 'admin' && product.vendor_id !== user.user_id) {
      throw new ForbiddenException('not your product');
    }

    if (dto.category_id !== undefined)
      product.category_id = dto.category_id ?? null;
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined)
      product.description = dto.description ?? null;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.stock !== undefined) product.stock = dto.stock;
    await this.bumpTenantCacheVersion(user.tenant_id);
    return this.repo.save(product);
  }

  async remove(user: AuthedUser, productId: number) {
    const product = await this.findOne(user.tenant_id, productId);

    if (user.role !== 'admin' && product.vendor_id !== user.user_id) {
      throw new ForbiddenException('not your product');
    }

    product.status = 0;
    await this.bumpTenantCacheVersion(user.tenant_id);
    return this.repo.save(product);
  }

  async addImage(
    user: AuthedUser,
    productId: number,
    url: string,
    isPrimary: number,
  ) {
    const product = await this.findOne(user.tenant_id, productId);

    if (user.role !== 'admin' && product.vendor_id !== user.user_id) {
      throw new ForbiddenException('not your product');
    }

    if (isPrimary === 1) {
      await this.imageRepo.update(
        { product_id: productId, status: 1 },
        { is_primary: 0 },
      );
    }

    const image = this.imageRepo.create({
      product_id: productId,
      url,
      is_primary: isPrimary,
      status: 1,
    });
    await this.bumpTenantCacheVersion(user.tenant_id);
    return this.imageRepo.save(image);
  }
  private async getTenantCacheVersion(tenantId: number): Promise<number> {
    const key = `products:ver:t${tenantId}`;
    const v = await this.cache.get<number>(key);
    return v ?? 1;
  }

  private async bumpTenantCacheVersion(tenantId: number): Promise<void> {
    const key = `products:ver:t${tenantId}`;
    const current = (await this.cache.get<number>(key)) ?? 1;
    await this.cache.set(key, current + 1, 24 * 60 * 60 * 1000); // keep version for 1 day
  }
}
