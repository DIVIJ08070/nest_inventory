import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepositery: Repository<User>,
  ) {}
  findByEmail(tenantId: number, email: string) {
    const result = this.userRepositery.query(
      'select * from User where tenatId = ? and email = ? limit(1)',
      [tenantId, email],
    );
    return result;
  }
  createUser(data: Partial<User>) {
    return this.userRepositery.save(this.userRepositery.create(data));
  }
}
