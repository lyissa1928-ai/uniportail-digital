import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

export interface AuditInput {
  utilisateurId?: number | null;
  email?: string | null;
  roles?: string[];

  methode: string;
  route: string;
  action: string;
  ressource: string;
  ressourceId?: string | null;

  adresseIp?: string | null;
  userAgent?: string | null;

  statusCode: number;
  succes: boolean;
  messageErreur?: string | null;
  dureeMs: number;
}

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async enregistrer(
    input: AuditInput,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          utilisateurId:
            input.utilisateurId ?? null,

          email:
            input.email ?? null,

          roles:
            input.roles ?? [],

          methode:
            input.methode,

          route:
            input.route,

          action:
            input.action,

          ressource:
            input.ressource,

          ressourceId:
            input.ressourceId ?? null,

          adresseIp:
            input.adresseIp ?? null,

          userAgent:
            input.userAgent ?? null,

          statusCode:
            input.statusCode,

          succes:
            input.succes,

          messageErreur:
            input.messageErreur
              ?.slice(0, 1000) ??
            null,

          dureeMs:
            input.dureeMs,
        },
      });
    }
    catch (error) {
      console.error(
        'Erreur écriture audit :',
        error,
      );
    }
  }

  async findAll(
    utilisateurId?: string,
    ressource?: string,
    succes?: string,
    dateDebut?: string,
    dateFin?: string,
    limite?: string,
  ) {
    const where: any = {};

    if (utilisateurId) {
      const id =
        Number(utilisateurId);

      if (
        Number.isInteger(id) &&
        id > 0
      ) {
        where.utilisateurId =
          id;
      }
    }

    if (ressource) {
      where.ressource = {
        contains:
          ressource,

        mode:
          'insensitive',
      };
    }

    if (
      succes === 'true'
    ) {
      where.succes =
        true;
    }

    if (
      succes === 'false'
    ) {
      where.succes =
        false;
    }

    if (
      dateDebut ||
      dateFin
    ) {
      where.createdAt = {};

      if (dateDebut) {
        where.createdAt.gte =
          new Date(dateDebut);
      }

      if (dateFin) {
        const fin =
          new Date(dateFin);

        fin.setUTCHours(
          23,
          59,
          59,
          999,
        );

        where.createdAt.lte =
          fin;
      }
    }

    let take =
      Number(limite ?? 100);

    if (
      !Number.isInteger(take) ||
      take < 1
    ) {
      take = 100;
    }

    take =
      Math.min(
        take,
        500,
      );

    return this.prisma.auditLog.findMany({
      where,

      include: {
        utilisateur: {
          select: {
            id: true,
            email: true,
            nomAffichage: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      take,
    });
  }

  async findOne(
    id: number,
  ) {
    const audit =
      await this.prisma.auditLog.findUnique({
        where: {
          id,
        },

        include: {
          utilisateur: {
            select: {
              id: true,
              email: true,
              nomAffichage: true,
            },
          },
        },
      });

    if (!audit) {
      throw new NotFoundException(
        `Audit ${id} introuvable`,
      );
    }

    return audit;
  }

  async statistiques(
    jours = 30,
  ) {
    const nombreJours =
      Math.min(
        Math.max(
          jours,
          1,
        ),
        365,
      );

    const depuis =
      new Date();

    depuis.setUTCDate(
      depuis.getUTCDate() -
      nombreJours,
    );

    const logs =
      await this.prisma.auditLog.findMany({
        where: {
          createdAt: {
            gte: depuis,
          },
        },

        select: {
          methode: true,
          ressource: true,
          succes: true,
          utilisateurId: true,
        },
      });

    const parRessource:
      Record<string, number> = {};

    const parMethode:
      Record<string, number> = {};

    for (
      const log
      of logs
    ) {
      parRessource[
        log.ressource
      ] =
        (
          parRessource[
            log.ressource
          ] ?? 0
        ) + 1;

      parMethode[
        log.methode
      ] =
        (
          parMethode[
            log.methode
          ] ?? 0
        ) + 1;
    }

    return {
      periodeJours:
        nombreJours,

      totalOperations:
        logs.length,

      operationsReussies:
        logs.filter(
          (log) =>
            log.succes,
        ).length,

      operationsEchouees:
        logs.filter(
          (log) =>
            !log.succes,
        ).length,

      utilisateursActifs:
        new Set(
          logs
            .map(
              (log) =>
                log.utilisateurId,
            )
            .filter(
              (
                id,
              ): id is number =>
                id !== null,
            ),
        ).size,

      parMethode,

      parRessource,
    };
  }
}
