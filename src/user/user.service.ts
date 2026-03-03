import { Injectable } from '@nestjs/common';
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
  findbyid(id: number) {
    return this.userRepositery.query('select * from users where user_id = ?', [
      id,
    ]);
  }
}
