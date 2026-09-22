import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSeanceDto } from './dto/create-seance.dto.js';
import { UpdateSeanceDto } from './dto/update-seance.dto.js';

@Injectable()
export class SeancesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private calculerDuree(
    heureDebut: string,
    heureFin: string,
  ): number {
    const [hd, md] = heureDebut
      .split(':')
      .map(Number);

    const [hf, mf] = heureFin
      .split(':')
      .map(Number);

    const debut = hd * 60 + md;
    const fin = hf * 60 + mf;

    const duree = fin - debut;

    if (duree <= 0) {
      throw new BadRequestException(
        "L'heure de fin doit Ãªtre postÃ©rieure Ã  l'heure de dÃ©but",
      );
    }

    if (duree > 720) {
      throw new BadRequestException(
        'Une sÃ©ance ne peut pas dÃ©passer 12 heures',
      );
    }

    return duree;
  }

  async create(dto: CreateSeanceDto) {
    const affectation =
      await this.prisma.affectationEnseignement.findUnique({
        where: {
          id: dto.affectationId,
        },

        include: {
          cours: true,
          classe: true,
          enseignant: true,
        },
      });

    if (!affectation) {
      throw new NotFoundException(
        `Affectation ${dto.affectationId} introuvable`,
      );
    }

    if (!affectation.actif) {
      throw new ConflictException(
        'Cette affectation pÃ©dagogique est inactive',
      );
    }

    const dateSeance =
      new Date(`${dto.dateSeance}T00:00:00.000Z`);

    if (Number.isNaN(dateSeance.getTime())) {
      throw new BadRequestException(
        'Date de sÃ©ance invalide',
      );
    }

    const dureeMinutes =
      this.calculerDuree(
        dto.heureDebut,
        dto.heureFin,
      );

    const existing =
      await this.prisma.seanceCours.findFirst({
        where: {
          affectationId: dto.affectationId,
          dateSeance,
          heureDebut: dto.heureDebut,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Une sÃ©ance existe dÃ©jÃ  Ã  cette date et cette heure',
      );
    }

    return this.prisma.seanceCours.create({
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
          dto.observations?.trim(),

        statut:
          'DECLAREE',
      },

      include: {
        affectation: {
          include: {
            enseignant: true,
            cours: true,
            classe: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.seanceCours.findMany({
      include: {
        affectation: {
          include: {
            enseignant: true,

            cours: {
              include: {
                niveau: {
                  include: {
                    formation: true,
                  },
                },
              },
            },

            classe: true,
          },
        },
      },

      orderBy: [
        {
          dateSeance: 'desc',
        },
        {
          heureDebut: 'desc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const seance =
      await this.prisma.seanceCours.findUnique({
        where: {
          id,
        },

        include: {
          affectation: {
            include: {
              enseignant: true,

              cours: {
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

              classe: true,
            },
          },
        },
      });

    if (!seance) {
      throw new NotFoundException(
        `SÃ©ance ${id} introuvable`,
      );
    }

    return seance;
  }

  async findByAffectation(
    affectationId: number,
  ) {
    const affectation =
      await this.prisma.affectationEnseignement.findUnique({
        where: {
          id: affectationId,
        },
      });

    if (!affectation) {
      throw new NotFoundException(
        `Affectation ${affectationId} introuvable`,
      );
    }

    return this.prisma.seanceCours.findMany({
      where: {
        affectationId,
      },

      orderBy: [
        {
          dateSeance: 'asc',
        },
        {
          heureDebut: 'asc',
        },
      ],
    });
  }

  async progression(
    affectationId: number,
  ) {
    const affectation =
      await this.prisma.affectationEnseignement.findUnique({
        where: {
          id: affectationId,
        },

        include: {
          enseignant: true,
          cours: true,
          classe: true,

          seances: {
            orderBy: {
              dateSeance: 'asc',
            },
          },
        },
      });

    if (!affectation) {
      throw new NotFoundException(
        `Affectation ${affectationId} introuvable`,
      );
    }

    const volumePrevuMinutes =
      affectation.cours.volumeHoraire * 60;

    const minutesDeclarees =
      affectation.seances
        .filter(
          (seance) =>
            seance.statut === 'DECLAREE' ||
            seance.statut === 'VALIDEE',
        )
        .reduce(
          (total, seance) =>
            total + seance.dureeMinutes,
          0,
        );

    const minutesValidees =
      affectation.seances
        .filter(
          (seance) =>
            seance.statut === 'VALIDEE',
        )
        .reduce(
          (total, seance) =>
            total + seance.dureeMinutes,
          0,
        );

    const minutesRestantes =
      Math.max(
        0,
        volumePrevuMinutes - minutesValidees,
      );

    const tauxDeclare =
      volumePrevuMinutes === 0
        ? 0
        : Number(
            (
              (minutesDeclarees /
                volumePrevuMinutes) *
              100
            ).toFixed(2),
          );

    const tauxValide =
      volumePrevuMinutes === 0
        ? 0
        : Number(
            (
              (minutesValidees /
                volumePrevuMinutes) *
              100
            ).toFixed(2),
          );

    return {
      affectationId:
        affectation.id,

      enseignant: {
        id:
          affectation.enseignant.id,

        matricule:
          affectation.enseignant.matricule,

        nom:
          affectation.enseignant.nom,

        prenom:
          affectation.enseignant.prenom,
      },

      cours: {
        id:
          affectation.cours.id,

        code:
          affectation.cours.code,

        intitule:
          affectation.cours.intitule,

        volumeHoraire:
          affectation.cours.volumeHoraire,

        credits:
          affectation.cours.credits,
      },

      classe: {
        id:
          affectation.classe.id,

        code:
          affectation.classe.code,

        nom:
          affectation.classe.nom,
      },

      anneeAcademique:
        affectation.anneeAcademique,

      volumePrevuHeures:
        affectation.cours.volumeHoraire,

      heuresDeclarees:
        Number(
          (minutesDeclarees / 60).toFixed(2),
        ),

      heuresValidees:
        Number(
          (minutesValidees / 60).toFixed(2),
        ),

      heuresRestantes:
        Number(
          (minutesRestantes / 60).toFixed(2),
        ),

      tauxExecutionDeclare:
        tauxDeclare,

      tauxExecutionValide:
        tauxValide,

      nombreSeances:
        affectation.seances.length,

      depassement:
        minutesValidees >
        volumePrevuMinutes,
    };
  }

  async update(
    id: number,
    dto: UpdateSeanceDto,
  ) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'VALIDEE') {
      throw new ConflictException(
        'Une sÃ©ance validÃ©e ne peut plus Ãªtre modifiÃ©e directement',
      );
    }

    if (seance.statut === 'ANNULEE') {
      throw new ConflictException(
        'Une sÃ©ance annulÃ©e ne peut pas Ãªtre modifiÃ©e',
      );
    }

    const heureDebut =
      dto.heureDebut ??
      seance.heureDebut;

    const heureFin =
      dto.heureFin ??
      seance.heureFin;

    const dureeMinutes =
      this.calculerDuree(
        heureDebut,
        heureFin,
      );

    const dateSeance =
      dto.dateSeance
        ? new Date(
            `${dto.dateSeance}T00:00:00.000Z`,
          )
        : seance.dateSeance;

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        dateSeance,
        heureDebut:
          dto.heureDebut,

        heureFin:
          dto.heureFin,

        dureeMinutes,

        contenu:
          dto.contenu?.trim(),

        observations:
          dto.observations?.trim(),
      },
    });
  }

  async valider(id: number) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'ANNULEE') {
      throw new ConflictException(
        'Une sÃ©ance annulÃ©e ne peut pas Ãªtre validÃ©e',
      );
    }

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        statut: 'VALIDEE',
      },
    });
  }

  async rejeter(id: number) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'VALIDEE') {
      throw new ConflictException(
        'Une sÃ©ance dÃ©jÃ  validÃ©e ne peut pas Ãªtre rejetÃ©e directement',
      );
    }

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        statut: 'REJETEE',
      },
    });
  }

  async annuler(id: number) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'VALIDEE') {
      throw new ConflictException(
        'Une sÃ©ance validÃ©e ne peut pas Ãªtre annulÃ©e directement',
      );
    }

    return this.prisma.seanceCours.update({
      where: {
        id,
      },

      data: {
        statut: 'ANNULEE',
      },
    });
  }

  async remove(id: number) {
    const seance =
      await this.findOne(id);

    if (seance.statut === 'VALIDEE') {
      throw new ConflictException(
        'Impossible de supprimer une sÃ©ance validÃ©e',
      );
    }

    return this.prisma.seanceCours.delete({
      where: {
        id,
      },
    });
  }
}
