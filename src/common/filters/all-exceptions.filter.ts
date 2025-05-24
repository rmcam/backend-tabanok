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

    let message: string;

    const responseMessage = exception.getResponse();
    if (typeof responseMessage === 'string') {
      message = responseMessage;
    } else if (
      typeof responseMessage === 'object' &&
      responseMessage !== null
    ) {
      message = JSON.stringify(responseMessage);
    } else {
      message = 'Unexpected error response';
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    if (exception instanceof Error) {
      this.logger.error(`${message}\n${exception.stack}`);
    } else {
      this.logger.error(message);
    }

    response.status(status).json(responseBody);
  }
}
