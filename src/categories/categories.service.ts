import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthedUser } from 'src/Common/types/authed-user';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private repo: Repository<Category>,
  ) {}

  create(user: AuthedUser, dto: CreateCategoryDto) {
    const category = this.repo.create({
      tenant_id: user.tenant_id,
      name: dto.name,
      description: dto.description ?? null,
      status: 1,
    });

    return this.repo.save(category);
  }

  findAll(tenantId: number) {
    return this.repo.find({
      where: {
        tenant_id: tenantId,
        status: 1,
      },
      order: { category_id: 'DESC' },
    });
  }

  async update(user: AuthedUser, id: number, dto: UpdateCategoryDto) {
    const category = await this.repo.findOne({
      where: {
        category_id: id,
        tenant_id: user.tenant_id,
      },
    });

    if (!category) throw new NotFoundException('category not found');

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined)
      category.description = dto.description ?? null;

    return this.repo.save(category);
  }

  async remove(user: AuthedUser, id: number) {
    const category = await this.repo.findOne({
      where: {
        category_id: id,
        tenant_id: user.tenant_id,
      },
    });

    if (!category) throw new NotFoundException('category not found');

    category.status = 0;

    return this.repo.save(category);
  }
}
