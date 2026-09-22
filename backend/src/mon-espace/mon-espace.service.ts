import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMaSeanceDto } from './dto/create-ma-seance.dto.js';

interface ConnectedUser {
  id: number;
  email: string;
  roles: string[];

  etudiant?: {
    id: number;
  } | null;

  enseignant?: {
    id: number;
  } | null;
}

@Injectable()
export class MonEspaceService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async profil(
    user: ConnectedUser,
  ) {
    const utilisateur =
      await this.prisma
        .utilisateur
        .findUnique({
          where: {
            id: user.id,
          },

          select: {
            id: true,
            email: true,
            nomAffichage: true,
            actif: true,
            derniereConnexion: true,
            createdAt: true,

            etudiant: true,
            enseignant: true,

            roles: {
              select: {
                role: {
                  select: {
                    code: true,
                    nom: true,
                  },
                },
              },
            },
          },
        });

    if (!utilisateur) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      );
    }

    return utilisateur;
  }

  /*
   * =========================================================
   * ETUDIANT
   * =========================================================
   */

  private getEtudiantId(
    user: ConnectedUser,
  ) {
    const id =
      user.etudiant?.id;

    if (!id) {
      throw new ForbiddenException(
        'Aucun profil étudiant associé à ce compte',
      );
    }

    return id;
  }

  async mesInscriptions(
    user: ConnectedUser,
  ) {
    const etudiantId =
      this.getEtudiantId(user);

    return this.prisma
      .inscriptionEtudiant
      .findMany({
        where: {
          etudiantId,
        },

        include: {
          classe: {
            include: {
              niveau: {
                include: {
                  formation: {
                    include: {
                      filiere: true,
                    },
                  },
                },
              },
            },
          },

          validationAcademique:
            true,

          demandeDiplome: {
            include: {
              diplome: true,
            },
          },
        },

        orderBy: {
          anneeAcademique:
            'desc',
        },
      });
  }

  async monEligibilite(
    user: ConnectedUser,
  ) {
    const etudiantId =
      this.getEtudiantId(user);

    const inscriptions =
      await this.prisma
        .inscriptionEtudiant
        .findMany({
          where: {
            etudiantId,

            classe: {
              niveau: {
                terminal: true,
              },
            },
          },

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

            validationAcademique:
              true,
          },

          orderBy: {
            anneeAcademique:
              'desc',
          },
        });

    return inscriptions.map(
      (inscription) => {
        const validation =
          inscription
            .validationAcademique;

        const motifs:
          string[] = [];

        if (
          inscription.statut !==
          'TERMINEE'
        ) {
          motifs.push(
            "L'inscription n'est pas terminée",
          );
        }

        if (!validation) {
          motifs.push(
            'Validation académique absente',
          );
        }

        if (
          validation &&
          validation.decision !==
            'ADMIS'
        ) {
          motifs.push(
            `Décision académique : ${validation.decision}`,
          );
        }

        if (
          validation &&
          validation
            .creditsObtenus <
            validation
              .creditsRequis
        ) {
          motifs.push(
            'Crédits insuffisants',
          );
        }

        if (
          validation
            ?.stageRequis &&
          !validation.stageValide
        ) {
          motifs.push(
            'Stage non validé',
          );
        }

        if (
          validation
            ?.memoireRequis &&
          !validation.memoireValide
        ) {
          motifs.push(
            'Mémoire non validé',
          );
        }

        if (
          validation &&
          validation.decision ===
            'ADMIS' &&
          !validation
            .dateDeliberation
        ) {
          motifs.push(
            'Date de délibération absente',
          );
        }

        return {
          inscriptionId:
            inscription.id,

          anneeAcademique:
            inscription
              .anneeAcademique,

          formation:
            inscription
              .classe
              .niveau
              .formation
              .nom,

          niveau:
            inscription
              .classe
              .niveau
              .nom,

          eligible:
            motifs.length === 0,

          statut:
            motifs.length === 0
              ? 'ELIGIBLE'
              : 'NON_ELIGIBLE',

          motifs,
        };
      },
    );
  }

  async mesDiplomes(
    user: ConnectedUser,
  ) {
    const etudiantId =
      this.getEtudiantId(user);

    return this.prisma
      .demandeDiplome
      .findMany({
        where: {
          inscription: {
            etudiantId,
          },
        },

        include: {
          diplome: true,

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

        orderBy: {
          dateDemande:
            'desc',
        },
      });
  }

  /*
   * =========================================================
   * ENSEIGNANT
   * =========================================================
   */

  private getEnseignantId(
    user: ConnectedUser,
  ) {
    const id =
      user.enseignant?.id;

    if (!id) {
      throw new ForbiddenException(
        'Aucun profil enseignant associé à ce compte',
      );
    }

    return id;
  }

  async mesAffectations(
    user: ConnectedUser,
  ) {
    const enseignantId =
      this.getEnseignantId(
        user,
      );

    return this.prisma
      .affectationEnseignement
      .findMany({
        where: {
          enseignantId,
        },

        include: {
          cours: {
            include: {
              niveau: {
                include: {
                  formation:
                    true,
                },
              },
            },
          },

          classe: {
            include: {
              niveau: true,
            },
          },
        },

        orderBy: [
          {
            anneeAcademique:
              'desc',
          },

          {
            id: 'desc',
          },
        ],
      });
  }

  async mesSeances(
    user: ConnectedUser,
  ) {
    const enseignantId =
      this.getEnseignantId(
        user,
      );

    return this.prisma
      .seanceCours
      .findMany({
        where: {
          affectation: {
            enseignantId,
          },
        },

        include: {
          affectation: {
            include: {
              cours: true,
              classe: true,
            },
          },
        },

        orderBy: [
          {
            dateSeance:
              'desc',
          },

          {
            heureDebut:
              'desc',
          },
        ],

        take: 200,
      });
  }

  async declarerMaSeance(
    user: ConnectedUser,
    dto: CreateMaSeanceDto,
  ) {
    const enseignantId =
      this.getEnseignantId(
        user,
      );

    const affectation =
      await this.prisma
        .affectationEnseignement
        .findUnique({
          where: {
            id:
              dto.affectationId,
          },

          include: {
            cours: true,
            classe: true,
          },
        });

    if (!affectation) {
      throw new NotFoundException(
        'Affectation introuvable',
      );
    }

    /*
     * Contrôle propriétaire critique :
     * l'ID reçu du client ne suffit jamais.
     */
    if (
      affectation.enseignantId !==
      enseignantId
    ) {
      throw new ForbiddenException(
        "Cette affectation n'appartient pas à l'enseignant connecté",
      );
    }

    if (!affectation.actif) {
      throw new BadRequestException(
        'Cette affectation est inactive',
      );
    }

    const [
      debutHeure,
      debutMinute,
    ] =
      dto.heureDebut
        .split(':')
        .map(Number);

    const [
      finHeure,
      finMinute,
    ] =
      dto.heureFin
        .split(':')
        .map(Number);

    const debut =
      debutHeure * 60 +
      debutMinute;

    const fin =
      finHeure * 60 +
      finMinute;

    if (fin <= debut) {
      throw new BadRequestException(
        "L'heure de fin doit être postérieure à l'heure de début",
      );
    }

    const dureeMinutes =
      fin - debut;

    if (
      dureeMinutes >
      12 * 60
    ) {
      throw new BadRequestException(
        'Durée de séance incohérente',
      );
    }

    const dateSeance =
      new Date(
        `${dto.dateSeance}T00:00:00.000Z`,
      );

    if (
      Number.isNaN(
        dateSeance.getTime(),
      )
    ) {
      throw new BadRequestException(
        'Date de séance invalide',
      );
    }

    const existe =
      await this.prisma
        .seanceCours
        .findFirst({
          where: {
            affectationId:
              dto.affectationId,

            dateSeance,

            heureDebut:
              dto.heureDebut,
          },
        });

    if (existe) {
      throw new ConflictException(
        'Une séance existe déjà à cette date et cette heure',
      );
    }

    return this.prisma
      .seanceCours
      .create({
        data: {
          affectationId:
            dto.affectationId,

          dateSeance,

          heureDebut:
            dto.heureDebut,

          heureFin:
            dto.heureFin,

          dureeMinutes,

          contenu:
            dto.contenu.trim(),

          observations:
            dto.observations
              ?.trim(),

          statut:
            'DECLAREE',
        },

        include: {
          affectation: {
            include: {
              cours: true,
              classe: true,
            },
          },
        },
      });
  }
}
