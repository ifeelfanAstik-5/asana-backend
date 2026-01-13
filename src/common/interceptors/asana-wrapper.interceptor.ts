import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AsanaWrapperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If the data is already wrapped or is an error, return as is
        if (data && data.data) return data;
        
        // Wrap everything else in the "data" envelope required by Asana YAML
        return { data };
      }),
    );
  }
}