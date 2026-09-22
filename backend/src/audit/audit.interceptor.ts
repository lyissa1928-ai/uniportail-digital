import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import {
  Observable,
  tap,
} from 'rxjs';

import { AuditService } from './audit.service.js';

@Injectable()
export class AuditInterceptor
  implements NestInterceptor
{
  constructor(
    private readonly audit:
      AuditService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request =
      context.switchToHttp()
        .getRequest();

    const response =
      context.switchToHttp()
        .getResponse();

    const methode =
      String(
        request.method ?? '',
      ).toUpperCase();

    /*
     * Les GET ne modifient pas les données.
     * On journalise uniquement les actions
     * susceptibles de changer l'état du SI.
     */
    const methodesAuditees =
      [
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
      ];

    if (
      !methodesAuditees.includes(
        methode,
      )
    ) {
      return next.handle();
    }

    const debut =
      Date.now();

    const route =
      String(
        request.originalUrl ??
        request.url ??
        '',
      ).split('?')[0];

    const chemin =
      route
        .replace(
          /^\/api\/?/,
          '',
        )
        .split('/')
        .filter(Boolean);

    const ressource =
      chemin[0] ??
      'inconnue';

    const ressourceId =
      chemin.find(
        (
          segment: string,
        ) =>
          /^\d+$/.test(
            segment,
          ),
      ) ?? null;

    const utilisateur =
      request.user;

    const adresseIp =
      request.ip ??
      request.socket
        ?.remoteAddress ??
      null;

    const userAgent =
      request.headers
        ?.['user-agent'] ??
      null;

    const base = {
      utilisateurId:
        utilisateur?.id ??
        null,

      email:
        utilisateur?.email ??
        null,

      roles:
        utilisateur?.roles ??
        [],

      methode,

      route,

      action:
        `${methode} ${route}`,

      ressource,

      ressourceId,

      adresseIp,

      userAgent,
    };

    return next.handle().pipe(
      tap({
        next: () => {
          void this.audit
            .enregistrer({
              ...base,

              statusCode:
                response.statusCode ??
                200,

              succes:
                true,

              dureeMs:
                Date.now() -
                debut,
            });
        },

        error: (
          error: any,
        ) => {
          void this.audit
            .enregistrer({
              ...base,

              statusCode:
                error?.status ??
                response.statusCode ??
                500,

              succes:
                false,

              messageErreur:
                error?.message ??
                'Erreur inconnue',

              dureeMs:
                Date.now() -
                debut,
            });
        },
      }),
    );
  }
}
