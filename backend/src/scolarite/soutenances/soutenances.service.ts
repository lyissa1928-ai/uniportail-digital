import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PrismaService,
} from '../../prisma/prisma.service.js';

import {
  CreateSoutenanceDto,
} from './dto/create-soutenance.dto.js';

import {
  UpdateSoutenanceDto,
} from './dto/update-soutenance.dto.js';

type DecisionSoutenanceValue =
  | 'EN_ATTENTE'
  | 'ADMIS'
  | 'AJOURNE'
  | 'REFUSE';

@Injectable()
export class SoutenancesService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  private decision(
    value?: string,
  ): DecisionSoutenanceValue {
    switch (value) {
      case 'ADMIS':
      case 'AJOURNE':
      case 'REFUSE':
      case 'EN_ATTENTE':
        return value;

      default:
        return 'EN_ATTENTE';
    }
  }

  private statut(
    value?: string,
  ) {
    switch (value) {
      case 'PLANIFIEE':
      case 'TENUE':
      case 'REPORTEE':
      case 'ANNULEE':
        return value;

      default:
        return 'PLANIFIEE';
    }
  }

  async create(
    dto: CreateSoutenanceDto,
  ) {
    const inscription =
      await this.prisma
        .inscriptionEtudiant
        .findUnique({
          where: {
            id:
              dto.inscriptionId,
          },

          include: {
            soutenance:
              true,

            etudiant:
              true,
          },
        });

    if (!inscription) {
      throw new NotFoundException(
        'Inscription introuvable',
      );
    }

    if (!inscription.etudiant.actif) {
      throw new ConflictException(
        'L étudiant est inactif',
      );
    }

    if (inscription.soutenance) {
      throw new ConflictException(
        'Une soutenance existe déjà pour cette inscription',
      );
    }

    return this.prisma
      .soutenance
      .create({
        data: {
          inscriptionId:
            dto.inscriptionId,

          sujet:
            dto.sujet.trim(),

          dateSoutenance:
            new Date(
              dto.dateSoutenance,
            ),

          heureDebut:
            dto.heureDebut
              ?.trim() ||
            null,

          heureFin:
            dto.heureFin
              ?.trim() ||
            null,

          lieu:
            dto.lieu
              ?.trim() ||
            null,

          statut:
            this.statut(
              dto.statut,
            ) as any,

          decision:
            this.decision(
              dto.decision,
            ),

          note:
            dto.note,

          mention:
            dto.mention
              ?.trim() ||
            null,

          numeroPv:
            dto.numeroPv
              ?.trim() ||
            null,

          presidentJury:
            dto.presidentJury
              ?.trim() ||
            null,

          membresJury:
            dto.membresJury
              ?.trim() ||
            null,

          observations:
            dto.observations
              ?.trim() ||
            null,
        },
      });
  }

  async findAll() {
    return this.prisma
      .soutenance
      .findMany({
        orderBy: [
          {
            dateSoutenance:
              'desc',
          },

          {
            id:
              'desc',
          },
        ],

        include: {
          inscription: {
            include: {
              etudiant:
                true,

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

  async findOne(
    id: number,
  ) {
    const soutenance =
      await this.prisma
        .soutenance
        .findUnique({
          where: {
            id,
          },

          include: {
            inscription: {
              include: {
                etudiant:
                  true,

                validationAcademique:
                  true,

                demandeDiplome:
                  true,

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

    if (!soutenance) {
      throw new NotFoundException(
        'Soutenance introuvable',
      );
    }

    return soutenance;
  }

  async update(
    id: number,
    dto: UpdateSoutenanceDto,
  ) {
    const soutenance =
      await this.findOne(
        id,
      );

    if (soutenance.validee) {
      throw new ConflictException(
        'Une soutenance validée doit être invalidée avant modification',
      );
    }

    return this.prisma
      .soutenance
      .update({
        where: {
          id,
        },

        data: {
          sujet:
            dto.sujet
              ?.trim(),

          dateSoutenance:
            dto.dateSoutenance
              ? new Date(
                  dto.dateSoutenance,
                )
              : undefined,

          heureDebut:
            dto.heureDebut === undefined
              ? undefined
              : dto.heureDebut.trim() ||
                null,

          heureFin:
            dto.heureFin === undefined
              ? undefined
              : dto.heureFin.trim() ||
                null,

          lieu:
            dto.lieu === undefined
              ? undefined
              : dto.lieu.trim() ||
                null,

          statut:
            dto.statut
              ? (this.statut(
                  dto.statut,
                ) as any)
              : undefined,

          decision:
            dto.decision
              ? this.decision(
                  dto.decision,
                )
              : undefined,

          note:
            dto.note,

          mention:
            dto.mention === undefined
              ? undefined
              : dto.mention.trim() ||
                null,

          numeroPv:
            dto.numeroPv === undefined
              ? undefined
              : dto.numeroPv.trim() ||
                null,

          presidentJury:
            dto.presidentJury === undefined
              ? undefined
              : dto.presidentJury.trim() ||
                null,

          membresJury:
            dto.membresJury === undefined
              ? undefined
              : dto.membresJury.trim() ||
                null,

          observations:
            dto.observations === undefined
              ? undefined
              : dto.observations.trim() ||
                null,
        },
      });
  }

  async valider(
    id: number,
    valideePar: string,
  ) {
    const soutenance =
      await this.findOne(
        id,
      );

    if (
      soutenance.decision ===
      'EN_ATTENTE'
    ) {
      throw new ConflictException(
        'Une décision finale est obligatoire avant validation de la soutenance',
      );
    }

    if (soutenance.validee) {
      throw new ConflictException(
        'Cette soutenance est déjà validée',
      );
    }

    return this.prisma
      .$transaction(
        async (tx) => {
          const updated =
            await tx
              .soutenance
              .update({
                where: {
                  id,
                },

                data: {
                  statut:
                    'TENUE',

                  validee:
                    true,

                  valideePar,

                  dateValidation:
                    new Date(),
                },
              });

          const validation =
            await tx
              .validationAcademique
              .findUnique({
                where: {
                  inscriptionId:
                    soutenance
                      .inscriptionId,
                },
              });

          if (validation) {
            await tx
              .validationAcademique
              .update({
                where: {
                  inscriptionId:
                    soutenance
                      .inscriptionId,
                },

                data: {
                  memoireValide:
                    soutenance.decision ===
                    'ADMIS',
                },
              });
          }

          return updated;
        },
      );
  }

  async candidats(
    anneeAcademique?: string,
  ) {
    return this.prisma
      .inscriptionEtudiant
      .findMany({
        where: {
          classe: {
            niveau: {
              terminal:
                true,
            },
          },

          ...(anneeAcademique
            ? {
                anneeAcademique,
              }
            : {}),

          soutenance:
            null,
        },

        orderBy: [
          {
            anneeAcademique:
              'desc',
          },

          {
            etudiant: {
              nom:
                'asc',
            },
          },
        ],

        include: {
          etudiant:
            true,

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
      });
  }

  async planning(
    anneeAcademique?: string,
  ) {
    return this.prisma
      .soutenance
      .findMany({
        where: {
          statut: {
            in: [
              'PLANIFIEE',
              'REPORTEE',
            ],
          },

          ...(anneeAcademique
            ? {
                inscription: {
                  anneeAcademique,
                },
              }
            : {}),
        },

        orderBy: [
          {
            dateSoutenance:
              'asc',
          },

          {
            heureDebut:
              'asc',
          },
        ],

        include: {
          inscription: {
            include: {
              etudiant:
                true,

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

  async terminees(
    anneeAcademique?: string,
  ) {
    return this.prisma
      .soutenance
      .findMany({
        where: {
          statut:
            'TENUE',

          validee:
            true,

          ...(anneeAcademique
            ? {
                inscription: {
                  anneeAcademique,
                },
              }
            : {}),
        },

        orderBy: [
          {
            dateSoutenance:
              'desc',
          },

          {
            id:
              'desc',
          },
        ],

        include: {
          inscription: {
            include: {
              etudiant:
                true,

              validationAcademique:
                true,

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

  async rapport(
    anneeAcademique?: string,
  ) {
    const soutenances =
      await this.prisma
        .soutenance
        .findMany({
          where:
            anneeAcademique
              ? {
                  inscription: {
                    anneeAcademique,
                  },
                }
              : {},

          include: {
            inscription: {
              include: {
                etudiant:
                  true,

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

    const parDecision:
      Record<string, number> = {};

    const parFormation:
      Record<string, number> = {};

    const parClasse:
      Record<string, number> = {};

    const parMention:
      Record<string, number> = {};

    for (
      const soutenance
      of soutenances
    ) {
      parDecision[
        soutenance.decision
      ] =
        (
          parDecision[
            soutenance.decision
          ] ?? 0
        ) + 1;

      const formation =
        soutenance.inscription
          .classe.niveau
          .formation.nom;

      const classe =
        soutenance.inscription
          .classe.nom;

      parFormation[
        formation
      ] =
        (
          parFormation[
            formation
          ] ?? 0
        ) + 1;

      parClasse[
        classe
      ] =
        (
          parClasse[
            classe
          ] ?? 0
        ) + 1;

      if (
        soutenance.mention
      ) {
        parMention[
          soutenance.mention
        ] =
          (
            parMention[
              soutenance.mention
            ] ?? 0
          ) + 1;
      }
    }

    const terminees =
      soutenances.filter(
        (item) =>
          item.statut ===
            'TENUE' &&
          item.validee,
      );

    return {
      anneeAcademique:
        anneeAcademique ??
        'TOUTES',

      total:
        soutenances.length,

      planifiees:
        soutenances.filter(
          (item) =>
            item.statut ===
            'PLANIFIEE',
        ).length,

      reportees:
        soutenances.filter(
          (item) =>
            item.statut ===
            'REPORTEE',
        ).length,

      annulees:
        soutenances.filter(
          (item) =>
            item.statut ===
            'ANNULEE',
        ).length,

      terminees:
        terminees.length,

      validees:
        soutenances.filter(
          (item) =>
            item.validee,
        ).length,

      parDecision,
      parFormation,
      parClasse,
      parMention,
    };
  }

  async invalider(
    id: number,
  ) {
    const soutenance =
      await this.findOne(
        id,
      );

    if (!soutenance.validee) {
      throw new ConflictException(
        'Cette soutenance n est pas validée',
      );
    }

    if (
      soutenance.inscription
        .demandeDiplome &&
      ![
        'DEMANDEE',
        'A_CORRIGER',
        'REJETEE',
        'ANNULEE',
      ].includes(
        soutenance.inscription
          .demandeDiplome
          .statut,
      )
    ) {
      throw new ConflictException(
        'La soutenance ne peut plus être invalidée car la demande de diplôme a déjà progressé',
      );
    }

    return this.prisma
      .$transaction(
        async (tx) => {
          const updated =
            await tx
              .soutenance
              .update({
                where: {
                  id,
                },

                data: {
                  validee:
                    false,

                  valideePar:
                    null,

                  dateValidation:
                    null,
                },
              });

          const validation =
            await tx
              .validationAcademique
              .findUnique({
                where: {
                  inscriptionId:
                    soutenance
                      .inscriptionId,
                },
              });

          if (validation) {
            await tx
              .validationAcademique
              .update({
                where: {
                  inscriptionId:
                    soutenance
                      .inscriptionId,
                },

                data: {
                  memoireValide:
                    false,
                },
              });
          }

          return updated;
        },
      );
  }
}