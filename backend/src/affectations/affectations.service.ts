import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAffectationDto } from './dto/create-affectation.dto.js';
import { UpdateAffectationDto } from './dto/update-affectation.dto.js';

@Injectable()
export class AffectationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private verifierAnnee(annee: string) {
    const [debut, fin] = annee
      .split('-')
      .map(Number);

    if (fin !== debut + 1) {
      throw new ConflictException(
        "L'année académique doit être consécutive, par exemple 2026-2027",
      );
    }
  }

  async create(dto: CreateAffectationDto) {
    this.verifierAnnee(dto.anneeAcademique);

    const enseignant =
      await this.prisma.enseignant.findUnique({
        where: {
          id: dto.enseignantId,
        },
      });

    if (!enseignant) {
      throw new NotFoundException(
        `Enseignant ${dto.enseignantId} introuvable`,
      );
    }

    const cours =
      await this.prisma.cours.findUnique({
        where: {
          id: dto.coursId,
        },
      });

    if (!cours) {
      throw new NotFoundException(
        `Cours ${dto.coursId} introuvable`,
      );
    }

    const classe =
      await this.prisma.classe.findUnique({
        where: {
          id: dto.classeId,
        },
      });

    if (!classe) {
      throw new NotFoundException(
        `Classe ${dto.classeId} introuvable`,
      );
    }

    if (cours.niveauId !== classe.niveauId) {
      throw new ConflictException(
        'Le cours et la classe doivent appartenir au même niveau',
      );
    }

    if (classe.annee !== dto.anneeAcademique) {
      throw new ConflictException(
        `La classe appartient à l'année ${classe.annee}`,
      );
    }

    const existe =
      await this.prisma.affectationEnseignement.findFirst({
        where: {
          enseignantId: dto.enseignantId,
          coursId: dto.coursId,
          classeId: dto.classeId,
          anneeAcademique:
            dto.anneeAcademique,
        },
      });

    if (existe) {
      throw new ConflictException(
        'Cette affectation existe déjà',
      );
    }

    return this.prisma.affectationEnseignement.create({
      data: {
        enseignantId:
          dto.enseignantId,

        coursId:
          dto.coursId,

        classeId:
          dto.classeId,

        anneeAcademique:
          dto.anneeAcademique,

        actif:
          dto.actif ?? true,
      },

      include: {
        enseignant: true,
        cours: true,
        classe: true,
      },
    });
  }

  async findAll() {
    return this.prisma.affectationEnseignement.findMany({
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

        classe: {
          include: {
            niveau: true,
          },
        },
      },

      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const affectation =
      await this.prisma.affectationEnseignement.findUnique({
        where: {
          id,
        },

        include: {
          enseignant: true,
          cours: true,
          classe: true,
        },
      });

    if (!affectation) {
      throw new NotFoundException(
        `Affectation ${id} introuvable`,
      );
    }

    return affectation;
  }

  async findByEnseignant(
    enseignantId: number,
  ) {
    return this.prisma.affectationEnseignement.findMany({
      where: {
        enseignantId,
      },

      include: {
        cours: true,
        classe: true,
      },

      orderBy: {
        anneeAcademique: 'desc',
      },
    });
  }

  async findByClasse(
    classeId: number,
  ) {
    return this.prisma.affectationEnseignement.findMany({
      where: {
        classeId,
      },

      include: {
        enseignant: true,
        cours: true,
      },
    });
  }

  async findByCours(
    coursId: number,
  ) {
    return this.prisma.affectationEnseignement.findMany({
      where: {
        coursId,
      },

      include: {
        enseignant: true,
        classe: true,
      },
    });
  }

  async findByAnnee(
    anneeAcademique: string,
  ) {
    return this.prisma.affectationEnseignement.findMany({
      where: {
        anneeAcademique,
      },

      include: {
        enseignant: true,
        cours: true,
        classe: true,
      },
    });
  }

  async update(
    id: number,
    dto: UpdateAffectationDto,
  ) {
    const actuelle =
      await this.findOne(id);

    const enseignantId =
      dto.enseignantId ??
      actuelle.enseignantId;

    const coursId =
      dto.coursId ??
      actuelle.coursId;

    const classeId =
      dto.classeId ??
      actuelle.classeId;

    const anneeAcademique =
      dto.anneeAcademique ??
      actuelle.anneeAcademique;

    this.verifierAnnee(
      anneeAcademique,
    );

    const cours =
      await this.prisma.cours.findUnique({
        where: {
          id: coursId,
        },
      });

    const classe =
      await this.prisma.classe.findUnique({
        where: {
          id: classeId,
        },
      });

    const enseignant =
      await this.prisma.enseignant.findUnique({
        where: {
          id: enseignantId,
        },
      });

    if (!cours) {
      throw new NotFoundException(
        `Cours ${coursId} introuvable`,
      );
    }

    if (!classe) {
      throw new NotFoundException(
        `Classe ${classeId} introuvable`,
      );
    }

    if (!enseignant) {
      throw new NotFoundException(
        `Enseignant ${enseignantId} introuvable`,
      );
    }

    if (
      cours.niveauId !==
      classe.niveauId
    ) {
      throw new ConflictException(
        'Le cours et la classe doivent appartenir au même niveau',
      );
    }

    if (
      classe.annee !==
      anneeAcademique
    ) {
      throw new ConflictException(
        `La classe appartient à l'année ${classe.annee}`,
      );
    }

    const duplicate =
      await this.prisma.affectationEnseignement.findFirst({
        where: {
          enseignantId,
          coursId,
          classeId,
          anneeAcademique,

          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      throw new ConflictException(
        'Cette affectation existe déjà',
      );
    }

    return this.prisma.affectationEnseignement.update({
      where: {
        id,
      },

      data: {
        enseignantId,
        coursId,
        classeId,
        anneeAcademique,
        actif:
          dto.actif ??
          actuelle.actif,
      },

      include: {
        enseignant: true,
        cours: true,
        classe: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const seances =
      await this.prisma.seanceCours.count({
        where: {
          affectationId: id,
        },
      });

    if (seances > 0) {
      throw new ConflictException(
        'Impossible de supprimer une affectation possédant des séances',
      );
    }

    return this.prisma.affectationEnseignement.delete({
      where: {
        id,
      },
    });
  }
}
