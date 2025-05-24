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

    let errorMessage: string | string[];

    const responseException = exception.getResponse();

    if (typeof responseException === 'string') {
      errorMessage = responseException;
    } else if (
      typeof responseException === 'object' &&
      responseException !== null &&
      'message' in responseException
    ) {
      // Si es un objeto con una propiedad 'message' (ej. de BadRequestException de ValidationPipe)
      if (Array.isArray((responseException as any).message)) {
        errorMessage = (responseException as any).message;
      } else {
        errorMessage = (responseException as any).message;
      }
    } else {
      // Mensaje genérico en español para otros errores
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          errorMessage = 'Solicitud inválida.';
          break;
        case HttpStatus.UNAUTHORIZED:
          errorMessage = 'No autorizado.';
          break;
        case HttpStatus.FORBIDDEN:
          errorMessage = 'Acceso denegado.';
          break;
        case HttpStatus.NOT_FOUND:
          errorMessage = 'Recurso no encontrado.';
          break;
        case HttpStatus.INTERNAL_SERVER_ERROR:
          errorMessage = 'Error interno del servidor.';
          break;
        case HttpStatus.CONFLICT:
          errorMessage = 'Conflicto de recursos.';
          break;
        default:
          errorMessage = 'Ha ocurrido un error inesperado.';
          break;
      }
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage, // Usar el mensaje de error procesado
    };

    if (exception instanceof Error) {
      this.logger.error(`${JSON.stringify(errorMessage)}\n${exception.stack}`);
    } else {
      this.logger.error(JSON.stringify(errorMessage));
    }

    response.status(status).json(responseBody);
  }
}
