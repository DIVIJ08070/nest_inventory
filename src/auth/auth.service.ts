/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { IsNull, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { RefreshToken } from './refresh-token.entity';

type DbUser = {
  user_id: number;
  tenant_id: number;
  role: string;
  password_hash?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UserService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  private signAccess(user: {
    user_id: number;
    tenant_id: number;
    role: string;
  }): string {
    const secret = process.env.jwt_access_secret;
    if (!secret) throw new Error('missing jwt_access_secret');

    const expiresIn = (process.env.jwt_access_expires ?? '15m') as StringValue;

    return this.jwt.sign(
      { sub: user.user_id, tenantId: user.tenant_id, role: user.role },
      { secret, expiresIn },
    );
  }

  private async signRefresh(user: {
    user_id: number;
    tenant_id: number;
  }): Promise<string> {
    const secret = process.env.jwt_refresh_secret;
    if (!secret) throw new Error('missing jwt_refresh_secret');

    const expiresIn = (process.env.jwt_refresh_expires ?? '7d') as StringValue;

    const refreshToken = this.jwt.sign(
      { sub: user.user_id, tenantId: user.tenant_id },
      { secret, expiresIn },
    );

    const hash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const entity = this.refreshTokenRepository.create({
      tenant_id: user.tenant_id,
      user_id: user.user_id,
      token_hash: hash,
      expires_at: expiresAt,
      revoked_at: null,
      status: 1,
    });

    await this.refreshTokenRepository.save(entity);
    return refreshToken;
  }

  async register(
    tenant_id: number,
    email: string,
    password: string,
    username: string,
  ) {
    const existing = await this.users.findByEmail(tenant_id, email);
    if (existing) throw new BadRequestException('email already exists');

    const password_hash = await bcrypt.hash(password, 10);

    const user: DbUser = await this.users.createUser({
      tenant_id,
      username,
      email,
      role: 'customer',
      password_hash,
      status: 1,
    });

    const accessToken = this.signAccess(user);
    const refreshToken = await this.signRefresh(user);

    return { accessToken, refreshToken };
  }

  async login(tenantId: number, email: string, password: string) {
    const user = await this.users.findByEmail(tenantId, email);
    if (!user) throw new UnauthorizedException('invalid credentials');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException('invalid credentials');

    const accessToken = this.signAccess(user);
    const refreshToken = await this.signRefresh(user);

    return { accessToken, refreshToken };
  }

  async refresh(
    payload: { sub: number; tenantId: number },
    refreshToken: string,
  ) {
    const record = await this.refreshTokenRepository.findOne({
      where: {
        user_id: payload.sub,
        tenant_id: payload.tenantId,
        revoked_at: IsNull(),
        status: 1,
      },
      order: { refresh_token_id: 'DESC' },
    });

    if (!record) throw new UnauthorizedException('refresh token revoked');

    const ok = await bcrypt.compare(refreshToken, record.token_hash);
    if (!ok) throw new UnauthorizedException('refresh token mismatch');

    record.revoked_at = new Date();
    record.status = 0;
    await this.refreshTokenRepository.save(record);

    const dbUser = await this.users.findbyid(payload.sub);
    if (!dbUser) throw new UnauthorizedException('user not found');

    const accessToken = this.signAccess(dbUser);
    const newRefreshToken = await this.signRefresh(dbUser);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async refreshToken(refreshToken: string) {
    let payload: { sub: number; tenantId: number };

    try {
      payload = this.jwt.verify(refreshToken, {
        secret: process.env.jwt_refresh_secret,
      });
    } catch {
      throw new UnauthorizedException('invalid refresh token');
    }

    return this.refresh(payload, refreshToken);
  }
}
