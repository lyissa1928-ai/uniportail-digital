import {
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

@Injectable()
export class PublicSiteService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async stats() {
    const now =
      new Date();

    const [
      etudiants,
      enseignants,
      formations,
      actualites,
    ] =
      await Promise.all([
        this.prisma
          .etudiant
          .count({
            where: {
              actif:
                true,
            },
          }),

        this.prisma
          .enseignant
          .count({
            where: {
              actif:
                true,
            },
          }),

        this.prisma
          .formation
          .count({
            where: {
              actif:
                true,
            },
          }),

        this.prisma
          .actualite
          .count({
            where: {
              publiee:
                true,

              dateDebut: {
                lte:
                  now,
              },

              dateFin: {
                gt:
                  now,
              },
            },
          }),
      ]);

    return {
      etudiants,
      enseignants,
      formations,
      actualites,
    };
  }
}
