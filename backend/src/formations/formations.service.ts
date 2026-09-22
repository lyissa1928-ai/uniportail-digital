import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFormationDto } from './dto/create-formation.dto.js';
import { UpdateFormationDto } from './dto/update-formation.dto.js';

@Injectable()
export class FormationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFormationDto) {
    const code = dto.code.trim().toUpperCase();

    // Vérifier que la filière existe
    const filiere = await this.prisma.filiere.findUnique({
      where: {
        id: dto.filiereId,
      },
    });

    if (!filiere) {
      throw new NotFoundException(
        `La filière ${dto.filiereId} n'existe pas`,
      );
    }

    // Vérifier l'unicité du code
    const existing = await this.prisma.formation.findUnique({
      where: {
        code,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Une formation avec le code ${code} existe déjà`,
      );
    }

    return this.prisma.formation.create({
      data: {
        code,
        nom: dto.nom.trim(),
        description: dto.description?.trim(),
        filiereId: dto.filiereId,
        actif: dto.actif ?? true,
      },
      include: {
        filiere: true,
      },
    });
  }

  async findAll() {
    return this.prisma.formation.findMany({
      include: {
        filiere: true,
        _count: {
          select: {
            niveaux: true,
          },
        },
      },
      orderBy: {
        nom: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const formation = await this.prisma.formation.findUnique({
      where: {
        id,
      },
      include: {
        filiere: true,
        niveaux: true,
      },
    });

    if (!formation) {
      throw new NotFoundException(
        `Formation ${id} introuvable`,
      );
    }

    return formation;
  }

  async findByFiliere(filiereId: number) {
    const filiere = await this.prisma.filiere.findUnique({
      where: {
        id: filiereId,
      },
    });

    if (!filiere) {
      throw new NotFoundException(
        `Filière ${filiereId} introuvable`,
      );
    }

    return this.prisma.formation.findMany({
      where: {
        filiereId,
      },
      orderBy: {
        nom: 'asc',
      },
    });
  }

  async update(id: number, dto: UpdateFormationDto) {
    await this.findOne(id);

    if (dto.filiereId !== undefined) {
      const filiere = await this.prisma.filiere.findUnique({
        where: {
          id: dto.filiereId,
        },
      });

      if (!filiere) {
        throw new NotFoundException(
          `La filière ${dto.filiereId} n'existe pas`,
        );
      }
    }

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();

      const existing = await this.prisma.formation.findFirst({
        where: {
          code,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Une formation avec le code ${code} existe déjà`,
        );
      }
    }

    return this.prisma.formation.update({
      where: {
        id,
      },
      data: {
        code: dto.code?.trim().toUpperCase(),
        nom: dto.nom?.trim(),
        description: dto.description?.trim(),
        filiereId: dto.filiereId,
        actif: dto.actif,
      },
      include: {
        filiere: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const niveaux = await this.prisma.niveau.count({
      where: {
        formationId: id,
      },
    });

    if (niveaux > 0) {
      throw new ConflictException(
        'Impossible de supprimer cette formation car elle possède des niveaux',
      );
    }

    return this.prisma.formation.delete({
      where: {
        id,
      },
    });
  }
}