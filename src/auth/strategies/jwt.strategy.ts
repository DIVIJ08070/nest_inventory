import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export type JwtPayload = {
  sub: number;
  tenantId: number;
  role: 'admin' | 'vendor' | 'customer';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt_access_secret'),
    });
  }

  validate(payload: JwtPayload) {
    return {
      user_id: payload.sub,
      tenant_id: payload.tenantId,
      role: payload.role,
    };
  }
}
