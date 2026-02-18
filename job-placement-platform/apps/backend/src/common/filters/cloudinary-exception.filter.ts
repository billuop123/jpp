import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { UploadApiErrorResponse } from 'cloudinary';
import { LoggerService } from 'src/logger/logger.service';

export class CloudinaryException extends Error {
  public readonly originalError: UploadApiErrorResponse | Error;

  constructor(originalError: UploadApiErrorResponse | Error) {
    super(
      (originalError as UploadApiErrorResponse)?.message ||
        originalError?.message ||
        'Cloudinary operation failed',
    );
    this.name = 'CloudinaryException';
    this.originalError = originalError;
  }
}

@Catch(CloudinaryException)
export class CloudinaryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CloudinaryExceptionFilter.name);

  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: CloudinaryException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const originalError = exception.originalError as UploadApiErrorResponse;
    const cloudinaryStatus = originalError?.http_code;

    let status =
      typeof cloudinaryStatus === 'number'
        ? cloudinaryStatus
        : HttpStatus.BAD_GATEWAY;

    if (status < 400 || status >= 600) {
      status = HttpStatus.BAD_GATEWAY;
    }

    const message =
      originalError?.message || exception.message || 'Cloudinary operation failed';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      provider: 'cloudinary',
      errorCode: originalError?.name,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.loggerService.log(`${request.method} ${request.url}`, 'fatal');
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(originalError),
      );
    }

    response.status(status).json(errorResponse);
  }
}

