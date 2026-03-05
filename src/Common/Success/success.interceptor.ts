import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: object) => {
        if (
          typeof data === 'object' &&
          data !== null &&
          'message' in data &&
          'data' in data
        ) {
          const typed = data as { message: string; data: object };

          return {
            success: true,
            statusCode: response.statusCode,
            message: typed.message,
            data: typed.data,
          };
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message: 'success',
          data: data ?? null,
        };
      }),
    );
  }
}
