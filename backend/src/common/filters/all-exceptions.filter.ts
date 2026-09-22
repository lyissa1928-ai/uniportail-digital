import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter
  implements ExceptionFilter
{
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const ctx =
      host.switchToHttp();

    const response =
      ctx.getResponse();

    const request =
      ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message:
      string | string[] =
      'Une erreur interne est survenue';

    let error =
      status >= 500
        ? 'Internal Server Error'
        : 'Erreur';

    if (
      exception instanceof
      HttpException
    ) {
      const httpResponse =
        exception.getResponse();

      if (
        typeof httpResponse ===
        'string'
      ) {
        message = httpResponse;
      }
      else if (
        httpResponse &&
        typeof httpResponse ===
          'object'
      ) {
        const body =
          httpResponse as Record<
            string,
            any
          >;

        message =
          body.message ??
          exception.message;

        error =
          body.error ??
          error;
      }
    }

    if (status >= 500) {
      console.error(
        '[ERREUR SERVEUR]',
        exception,
      );
    }

    response
      .status(status)
      .json({
        statusCode:
          status,

        error,

        message,

        timestamp:
          new Date()
            .toISOString(),

        method:
          request.method,

        path:
          request.originalUrl ??
          request.url,

        requestId:
          request.requestId ??
          null,
      });
  }
}
