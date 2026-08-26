import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Don't expose stack traces in production
        // Log full error details for debugging
        if (error instanceof Error) {
          // Normalize error response
          return throwError(() => ({
            statusCode: error.statusCode || 500,
            message: error.message || 'Internal server error',
            error: error.name || 'Error',
          }));
        }
        return throwError(() => ({
          statusCode: 500,
          message: 'Internal server error',
          error: 'Error',
        }));
      }),
    );
  }
}
