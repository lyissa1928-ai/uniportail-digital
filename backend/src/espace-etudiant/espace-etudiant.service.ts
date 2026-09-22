import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

@Injectable()
export class EspaceEtudiantService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async soutenances(
    utilisateurId: number,
  ) {
    const utilisateur =
      await this.prisma.utilisateur.findUnique({
        where: {
          id: utilisateurId,
        },

        select: {
          id: true,
          etudiantId: true,
        },
      });

    if (!utilisateur) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      );
    }

    if (!utilisateur.etudiantId) {
      throw new ForbiddenException(
        'Ce compte n’est pas associé à un étudiant',
      );
    }

    const inscriptions =
      await this.prisma.inscriptionEtudiant.findMany({
        where: {
          etudiantId:
            utilisateur.etudiantId,
        },

        select: {
          id: true,
        },
      });

    const inscriptionIds =
      inscriptions.map(
        (item) => item.id,
      );

    if (
      inscriptionIds.length === 0
    ) {
      return [];
    }

    return this.prisma.soutenance.findMany({
      where: {
        inscriptionId: {
          in: inscriptionIds,
        },
      },

      orderBy: {
        dateSoutenance:
          'desc',
      },

      include: {
        inscription: {
          include: {
            classe: {
              include: {
                niveau: {
                  include: {
                    formation:
                      true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}