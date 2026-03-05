import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepositery: Repository<User>,
  ) {}
  findByEmail(tenantId: number, email: string): Promise<User | null> {
    const result = this.userRepositery.findOne({
      where: { tenant_id: tenantId, email },
    });
    return result;
  }
  createUser(data: Partial<User>) {
    return this.userRepositery.save(this.userRepositery.create(data));
  }
  async findbyid(tenantId: number, userId: number) {
    return this.userRepositery.findOne({
      where: {
        tenant_id: tenantId,
        user_id: userId,
      },
    });
  }
  async makeVendor(userId: number, tenantId: number) {
    const user = await this.userRepositery.findOne({
      where: {
        user_id: userId,
        tenant_id: tenantId,
      },
    });

    if (!user) throw new NotFoundException('user not found');

    user.role = 'vendor';

    return this.userRepositery.save(user);
  }
  async makeAdmin(userId: number, tenantId: number) {
    const user = await this.userRepositery.findOne({
      where: {
        user_id: userId,
        tenant_id: tenantId,
      },
    });

    if (!user) throw new NotFoundException('user not found');

    user.role = 'admin';

    return this.userRepositery.save(user);
  }
}
