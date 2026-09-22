import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClasseDto } from './dto/create-classe.dto.js';
import { UpdateClasseDto } from './dto/update-classe.dto.js';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClasseDto) {
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

    const existing = await this.prisma.classe.findFirst({
      where: {
        niveauId: dto.niveauId,
        code,
        annee: dto.annee,
      },
    });

    if (existing) {
      throw new ConflictException(
        `La classe ${code} existe déjà pour l'année ${dto.annee}`,
      );
    }

    return this.prisma.classe.create({
      data: {
        code,
        nom: dto.nom.trim(),
        annee: dto.annee,
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
    return this.prisma.classe.findMany({
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
          annee: 'desc',
        },
        {
          nom: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const classe = await this.prisma.classe.findUnique({
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

    if (!classe) {
      throw new NotFoundException(
        `Classe ${id} introuvable`,
      );
    }

    return classe;
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

    return this.prisma.classe.findMany({
      where: {
        niveauId,
      },

      orderBy: [
        {
          annee: 'desc',
        },
        {
          nom: 'asc',
        },
      ],
    });
  }

  async findByAnnee(annee: string) {
    return this.prisma.classe.findMany({
      where: {
        annee,
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

      orderBy: {
        nom: 'asc',
      },
    });
  }

  async update(id: number, dto: UpdateClasseDto) {
    const classe = await this.findOne(id);

    const niveauId =
      dto.niveauId ?? classe.niveauId;

    const code =
      dto.code?.trim().toUpperCase() ?? classe.code;

    const annee =
      dto.annee ?? classe.annee;

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

    const existing = await this.prisma.classe.findFirst({
      where: {
        niveauId,
        code,
        annee,

        NOT: {
          id,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `La classe ${code} existe déjà pour l'année ${annee}`,
      );
    }

    return this.prisma.classe.update({
      where: {
        id,
      },

      data: {
        code: dto.code?.trim().toUpperCase(),
        nom: dto.nom?.trim(),
        annee: dto.annee,
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

    return this.prisma.classe.delete({
      where: {
        id,
      },
    });
  }
}
