import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AuthedUser } from 'src/Common/types/authed-user';

type ReqWithUser = Request & { user?: AuthedUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthedUser => {
    const req = ctx.switchToHttp().getRequest<ReqWithUser>();

    return req.user as AuthedUser;
  },
);
