import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCoursDto } from './dto/create-cours.dto.js';
import { UpdateCoursDto } from './dto/update-cours.dto.js';

@Injectable()
export class CoursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCoursDto) {
    const code = dto.code.trim().toUpperCase();

    const niveau = await this.prisma.niveau.findUnique({
      where: {
        id: dto.niveauId,
      },
    });

    if (!niveau) {
      throw new NotFoundException(
        `Le niveau ${dto.niveauId} n'existe pas`,
      );
    }

    const existing = await this.prisma.cours.findFirst({
      where: {
        niveauId: dto.niveauId,
        code,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Le cours ${code} existe déjà dans ce niveau`,
      );
    }

    return this.prisma.cours.create({
      data: {
        code,
        intitule: dto.intitule.trim(),
        volumeHoraire: dto.volumeHoraire,
        credits: dto.credits,
        semestre: dto.semestre,
        niveauId: dto.niveauId,
        actif: dto.actif ?? true,
      },

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
    });
  }

  async findAll() {
    return this.prisma.cours.findMany({
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

      orderBy: [
        {
          niveauId: 'asc',
        },
        {
          semestre: 'asc',
        },
        {
          intitule: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const cours = await this.prisma.cours.findUnique({
      where: {
        id,
      },

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
    });

    if (!cours) {
      throw new NotFoundException(
        `Cours ${id} introuvable`,
      );
    }

    return cours;
  }

  async findByNiveau(niveauId: number) {
    const niveau = await this.prisma.niveau.findUnique({
      where: {
        id: niveauId,
      },
    });

    if (!niveau) {
      throw new NotFoundException(
        `Niveau ${niveauId} introuvable`,
      );
    }

    return this.prisma.cours.findMany({
      where: {
        niveauId,
      },

      orderBy: [
        {
          semestre: 'asc',
        },
        {
          intitule: 'asc',
        },
      ],
    });
  }

  async findBySemestre(semestre: number) {
    return this.prisma.cours.findMany({
      where: {
        semestre,
      },

      include: {
        niveau: {
          include: {
            formation: true,
          },
        },
      },

      orderBy: {
        intitule: 'asc',
      },
    });
  }

  async update(id: number, dto: UpdateCoursDto) {
    const cours = await this.findOne(id);

    const niveauId =
      dto.niveauId ?? cours.niveauId;

    const code =
      dto.code?.trim().toUpperCase() ?? cours.code;

    if (dto.niveauId !== undefined) {
      const niveau = await this.prisma.niveau.findUnique({
        where: {
          id: dto.niveauId,
        },
      });

      if (!niveau) {
        throw new NotFoundException(
          `Le niveau ${dto.niveauId} n'existe pas`,
        );
      }
    }

    const existing = await this.prisma.cours.findFirst({
      where: {
        niveauId,
        code,

        NOT: {
          id,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Le cours ${code} existe déjà dans ce niveau`,
      );
    }

    return this.prisma.cours.update({
      where: {
        id,
      },

      data: {
        code: dto.code?.trim().toUpperCase(),
        intitule: dto.intitule?.trim(),
        volumeHoraire: dto.volumeHoraire,
        credits: dto.credits,
        semestre: dto.semestre,
        niveauId: dto.niveauId,
        actif: dto.actif,
      },

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
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.cours.delete({
      where: {
        id,
      },
    });
  }
}
