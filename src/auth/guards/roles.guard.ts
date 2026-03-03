import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

type ReqUser = { role?: 'admin' | 'vendor' | 'customer' };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required =
      this.reflector.getAllAndOverride<Array<'admin' | 'vendor' | 'customer'>>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [];

    if (required.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: ReqUser }>();
    const role = req.user?.role;

    if (!role) throw new ForbiddenException('missing role');

    const ok = required.includes(role);
    if (!ok) throw new ForbiddenException('insufficient role');

    return true;
  }
}
