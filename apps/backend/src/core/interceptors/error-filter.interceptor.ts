import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: any) => {
        const statusCode = error.statusCode || error.status || 500;
        const message = error.message || 'Internal server error';
        const errorName = error.name || 'Error';
        return throwError(() => ({
          statusCode,
          message,
          error: errorName,
        }));
      }),
    );
  }
}
