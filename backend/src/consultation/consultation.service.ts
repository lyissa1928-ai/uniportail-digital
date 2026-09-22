import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { EtudiantsQueryDto } from './dto/etudiants-query.dto.js';
import { EnseignantsQueryDto } from './dto/enseignants-query.dto.js';
import { AffectationsQueryDto } from './dto/affectations-query.dto.js';
import { DiplomesQueryDto } from './dto/diplomes-query.dto.js';

@Injectable()
export class ConsultationService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  private pagination(
    page: number,
    limit: number,
    total: number,
  ) {
    const totalPages =
      Math.max(
        Math.ceil(
          total / limit,
        ),
        1,
      );

    return {
      page,
      limit,
      total,
      totalPages,

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page < totalPages,
    };
  }

  async etudiants(
    query:
      EtudiantsQueryDto,
  ) {
    const page =
      query.page ?? 1;

    const limit =
      query.limit ?? 20;

    const skip =
      (page - 1) *
      limit;

    const search =
      query.search
        ?.trim();

    const where: any = {};

    if (
      query.actif !==
      undefined
    ) {
      where.actif =
        query.actif ===
        'true';
    }

    if (search) {
      where.OR = [
        {
          matricule: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          nom: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          prenom: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          telephone: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const sortBy =
      query.sortBy ??
      'createdAt';

    const sortOrder =
      query.sortOrder ??
      'desc';

    const [
      total,
      data,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .etudiant
            .count({
              where,
            }),

          this.prisma
            .etudiant
            .findMany({
              where,

              select: {
                id: true,
                matricule: true,
                nom: true,
                prenom: true,
                dateNaissance: true,
                email: true,
                telephone: true,
                actif: true,
                createdAt: true,
                updatedAt: true,

                inscriptions: {
                  select: {
                    id: true,
                    anneeAcademique:
                      true,
                    statut: true,

                    classe: {
                      select: {
                        id: true,
                        code: true,
                        nom: true,

                        niveau: {
                          select: {
                            id: true,
                            code: true,
                            nom: true,

                            formation: {
                              select: {
                                id: true,
                                code: true,
                                nom: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },

                  orderBy: {
                    anneeAcademique:
                      'desc',
                  },

                  take: 1,
                },
              },

              orderBy: {
                [sortBy]:
                  sortOrder,
              } as any,

              skip,
              take:
                limit,
            }),
        ]);

    return {
      data,

      meta:
        this.pagination(
          page,
          limit,
          total,
        ),

      filters: {
        search:
          search ?? null,

        actif:
          query.actif ??
          null,

        sortBy,
        sortOrder,
      },
    };
  }

  async enseignants(
    query:
      EnseignantsQueryDto,
  ) {
    const page =
      query.page ?? 1;

    const limit =
      query.limit ?? 20;

    const skip =
      (page - 1) *
      limit;

    const search =
      query.search
        ?.trim();

    const where: any = {};

    if (
      query.actif !==
      undefined
    ) {
      where.actif =
        query.actif ===
        'true';
    }

    if (query.statut) {
      where.statut = {
        equals:
          query.statut,

        mode:
          'insensitive',
      };
    }

    if (search) {
      where.OR = [
        {
          matricule: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          nom: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          prenom: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          specialite: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const sortBy =
      query.sortBy ??
      'createdAt';

    const sortOrder =
      query.sortOrder ??
      'desc';

    const [
      total,
      data,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .enseignant
            .count({
              where,
            }),

          this.prisma
            .enseignant
            .findMany({
              where,

              include: {
                _count: {
                  select: {
                    affectations:
                      true,
                  },
                },
              },

              orderBy: {
                [sortBy]:
                  sortOrder,
              } as any,

              skip,
              take:
                limit,
            }),
        ]);

    return {
      data,

      meta:
        this.pagination(
          page,
          limit,
          total,
        ),

      filters: {
        search:
          search ?? null,

        actif:
          query.actif ??
          null,

        statut:
          query.statut ??
          null,

        sortBy,
        sortOrder,
      },
    };
  }

  async affectations(
    query:
      AffectationsQueryDto,
  ) {
    const page =
      query.page ?? 1;

    const limit =
      query.limit ?? 20;

    const skip =
      (page - 1) *
      limit;

    const where: any = {};

    if (query.annee) {
      where.anneeAcademique =
        query.annee;
    }

    if (
      query.enseignantId
    ) {
      where.enseignantId =
        query.enseignantId;
    }

    if (query.coursId) {
      where.coursId =
        query.coursId;
    }

    if (query.classeId) {
      where.classeId =
        query.classeId;
    }

    if (
      query.actif !==
      undefined
    ) {
      where.actif =
        query.actif ===
        'true';
    }

    const search =
      query.search
        ?.trim();

    if (search) {
      where.OR = [
        {
          enseignant: {
            nom: {
              contains:
                search,
              mode:
                'insensitive',
            },
          },
        },

        {
          enseignant: {
            prenom: {
              contains:
                search,
              mode:
                'insensitive',
            },
          },
        },

        {
          enseignant: {
            matricule: {
              contains:
                search,
              mode:
                'insensitive',
            },
          },
        },

        {
          cours: {
            code: {
              contains:
                search,
              mode:
                'insensitive',
            },
          },
        },

        {
          cours: {
            intitule: {
              contains:
                search,
              mode:
                'insensitive',
            },
          },
        },

        {
          classe: {
            code: {
              contains:
                search,
              mode:
                'insensitive',
            },
          },
        },
      ];
    }

    const sortBy =
      query.sortBy ??
      'createdAt';

    const sortOrder =
      query.sortOrder ??
      'desc';

    const [
      total,
      data,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .affectationEnseignement
            .count({
              where,
            }),

          this.prisma
            .affectationEnseignement
            .findMany({
              where,

              include: {
                enseignant: true,
                cours: true,
                classe: true,

                _count: {
                  select: {
                    seances:
                      true,
                  },
                },
              },

              orderBy: {
                [sortBy]:
                  sortOrder,
              } as any,

              skip,
              take:
                limit,
            }),
        ]);

    return {
      data,

      meta:
        this.pagination(
          page,
          limit,
          total,
        ),

      filters: {
        search:
          search ?? null,

        annee:
          query.annee ??
          null,

        enseignantId:
          query.enseignantId ??
          null,

        coursId:
          query.coursId ??
          null,

        classeId:
          query.classeId ??
          null,

        actif:
          query.actif ??
          null,

        sortBy,
        sortOrder,
      },
    };
  }

  async diplomes(
    query:
      DiplomesQueryDto,
  ) {
    const page =
      query.page ?? 1;

    const limit =
      query.limit ?? 20;

    const skip =
      (page - 1) *
      limit;

    const where: any = {};

    const statutsAutorises = [
      'DEMANDEE',
      'EN_VERIFICATION',
      'A_CORRIGER',
      'VALIDEE',
      'REJETEE',
      'GENEREE',
      'SIGNEE',
      'DISPONIBLE',
      'RETIREE',
      'ANNULEE',
    ];

    if (query.statut) {
      const statut =
        query.statut
          .trim()
          .toUpperCase();

      if (
        !statutsAutorises
          .includes(statut)
      ) {
        throw new BadRequestException(
          'Statut de demande de diplôme invalide',
        );
      }

      where.statut =
        statut;
    }

    if (query.annee) {
      where.inscription = {
        anneeAcademique:
          query.annee,
      };
    }

    const search =
      query.search
        ?.trim();

    if (search) {
      where.OR = [
        {
          inscription: {
            etudiant: {
              matricule: {
                contains:
                  search,
                mode:
                  'insensitive',
              },
            },
          },
        },

        {
          inscription: {
            etudiant: {
              nom: {
                contains:
                  search,
                mode:
                  'insensitive',
              },
            },
          },
        },

        {
          inscription: {
            etudiant: {
              prenom: {
                contains:
                  search,
                mode:
                  'insensitive',
              },
            },
          },
        },

        {
          diplome: {
            numero: {
              contains:
                search,
              mode:
                'insensitive',
            },
          },
        },
      ];
    }

    const sortBy =
      query.sortBy ??
      'dateDemande';

    const sortOrder =
      query.sortOrder ??
      'desc';

    const [
      total,
      data,
    ] =
      await this.prisma
        .$transaction([
          this.prisma
            .demandeDiplome
            .count({
              where,
            }),

          this.prisma
            .demandeDiplome
            .findMany({
              where,

              include: {
                diplome:
                  true,

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

              orderBy: {
                [sortBy]:
                  sortOrder,
              } as any,

              skip,
              take:
                limit,
            }),
        ]);

    return {
      data,

      meta:
        this.pagination(
          page,
          limit,
          total,
        ),

      filters: {
        search:
          search ?? null,

        statut:
          query.statut ??
          null,

        annee:
          query.annee ??
          null,

        sortBy,
        sortOrder,
      },
    };
  }
}
