import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNiveauDto } from './dto/create-niveau.dto.js';
import { UpdateNiveauDto } from './dto/update-niveau.dto.js';

@Injectable()
export class NiveauxService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNiveauDto) {
    const code = dto.code.trim().toUpperCase();

    const formation = await this.prisma.formation.findUnique({
      where: {
        id: dto.formationId,
      },
    });

    if (!formation) {
      throw new NotFoundException(
        `La formation ${dto.formationId} n'existe pas`,
      );
    }

    const existing = await this.prisma.niveau.findFirst({
      where: {
        formationId: dto.formationId,
        code,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Le niveau ${code} existe déjà dans cette formation`,
      );
    }

    return this.prisma.niveau.create({
      data: {
        code,
        nom: dto.nom.trim(),
        ordre: dto.ordre,
        terminal: dto.terminal ?? false,
        actif: dto.actif ?? true,
        formationId: dto.formationId,
      },
      include: {
        formation: {
          include: {
            filiere: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.niveau.findMany({
      include: {
        formation: {
          include: {
            filiere: true,
          },
        },
        _count: {
          select: {
            classes: true,
            cours: true,
          },
        },
      },
      orderBy: [
        {
          formationId: 'asc',
        },
        {
          ordre: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const niveau = await this.prisma.niveau.findUnique({
      where: {
        id,
      },
      include: {
        formation: {
          include: {
            filiere: true,
          },
        },
        classes: true,
        cours: true,
      },
    });

    if (!niveau) {
      throw new NotFoundException(
        `Niveau ${id} introuvable`,
      );
    }

    return niveau;
  }

  async findByFormation(formationId: number) {
    const formation = await this.prisma.formation.findUnique({
      where: {
        id: formationId,
      },
    });

    if (!formation) {
      throw new NotFoundException(
        `Formation ${formationId} introuvable`,
      );
    }

    return this.prisma.niveau.findMany({
      where: {
        formationId,
      },
      orderBy: {
        ordre: 'asc',
      },
    });
  }

  async findTerminaux() {
    return this.prisma.niveau.findMany({
      where: {
        terminal: true,
        actif: true,
      },
      include: {
        formation: {
          include: {
            filiere: true,
          },
        },
      },
      orderBy: {
        ordre: 'asc',
      },
    });
  }

  async update(id: number, dto: UpdateNiveauDto) {
    const niveau = await this.findOne(id);

    const formationId =
      dto.formationId ?? niveau.formationId;

    if (dto.formationId !== undefined) {
      const formation = await this.prisma.formation.findUnique({
        where: {
          id: dto.formationId,
        },
      });

      if (!formation) {
        throw new NotFoundException(
          `La formation ${dto.formationId} n'existe pas`,
        );
      }
    }

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();

      const existing = await this.prisma.niveau.findFirst({
        where: {
          formationId,
          code,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Le niveau ${code} existe déjà dans cette formation`,
        );
      }
    }

    return this.prisma.niveau.update({
      where: {
        id,
      },
      data: {
        code: dto.code?.trim().toUpperCase(),
        nom: dto.nom?.trim(),
        ordre: dto.ordre,
        terminal: dto.terminal,
        actif: dto.actif,
        formationId: dto.formationId,
      },
      include: {
        formation: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const classes = await this.prisma.classe.count({
      where: {
        niveauId: id,
      },
    });

    const cours = await this.prisma.cours.count({
      where: {
        niveauId: id,
      },
    });

    if (classes > 0 || cours > 0) {
      throw new ConflictException(
        'Impossible de supprimer ce niveau car il possède des classes ou des cours',
      );
    }

    return this.prisma.niveau.delete({
      where: {
        id,
      },
    });
  }
}