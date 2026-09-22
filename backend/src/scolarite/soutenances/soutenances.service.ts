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

          decision:
            this.decision(
              dto.decision,
            ),

          note:
            dto.note,

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

          decision:
            dto.decision
              ? this.decision(
                  dto.decision,
                )
              : undefined,

          note:
            dto.note,

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
      soutenance.decision !==
      'ADMIS'
    ) {
      throw new ConflictException(
        'Seule une soutenance avec décision ADMIS peut être validée',
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
                    true,
                },
              });
          }

          return updated;
        },
      );
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