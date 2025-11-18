import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from 'src/logger/logger.service';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  constructor(private readonly loggerService: LoggerService) {
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();  
    let message: string;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      const responseMessage = (exceptionResponse as any).message || exception.message;
      message = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : responseMessage;
    }
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.loggerService.log(`${request.method} ${request.url}`, 'fatal');
      this.logger.error(
        `${request.method} ${request.url}`,
        exception.stack,
      );
    }

    response.status(status).json(errorResponse);
  }
}

