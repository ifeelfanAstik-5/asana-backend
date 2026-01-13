import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class AsanaExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errors = typeof exceptionResponse === 'string'
      ? [{ message: exceptionResponse }]
      : Array.isArray((exceptionResponse as any).message)
        ? (exceptionResponse as any).message.map((m) => ({ message: m }))
        : [{ message: (exceptionResponse as any).message || (exceptionResponse as any).error }];

    response.status(status).json({
      data: { errors }
    });
  }
}