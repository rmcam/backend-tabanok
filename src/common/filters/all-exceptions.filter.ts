import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status = exception.getStatus();

    const errorResponse = exception.getResponse();
    let message: string | string[];
    let errorName: string;

    if (typeof errorResponse === 'string') {
      message = errorResponse;
      errorName = exception.name;
    } else if (typeof errorResponse === 'object' && errorResponse !== null) {
      // Si la respuesta es un objeto, puede contener 'message' y 'error'
      // Esto es común con las excepciones de NestJS (ej. BadRequestException)
      message = (errorResponse as any).message || 'Unexpected error';
      errorName = (errorResponse as any).error || exception.name;
    } else {
      message = 'Unexpected error response';
      errorName = exception.name;
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorName,
      message: message,
    };

    if (exception instanceof Error) {
      this.logger.error(`${message}\n${exception.stack}`);
    } else {
      this.logger.error(message);
    }

    response.status(status).json(responseBody);
  }
}
