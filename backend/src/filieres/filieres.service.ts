import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFiliereDto } from './dto/create-filiere.dto.js';
import { UpdateFiliereDto } from './dto/update-filiere.dto.js';

@Injectable()
export class FilieresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFiliereDto) {
    const code = dto.code.trim().toUpperCase();

    const existing = await this.prisma.filiere.findUnique({
      where: { code },
    });

    if (existing) {
      throw new ConflictException(
        `Une filière avec le code ${code} existe déjà`,
      );
    }

    return this.prisma.filiere.create({
      data: {
        code,
        nom: dto.nom.trim(),
        description: dto.description?.trim(),
        actif: dto.actif ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.filiere.findMany({
      orderBy: {
        nom: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const filiere = await this.prisma.filiere.findUnique({
      where: { id },
      include: {
        formations: true,
      },
    });

    if (!filiere) {
      throw new NotFoundException(`Filière ${id} introuvable`);
    }

    return filiere;
  }

  async update(id: number, dto: UpdateFiliereDto) {
    await this.findOne(id);

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();

      const existing = await this.prisma.filiere.findFirst({
        where: {
          code,
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Une filière avec le code ${code} existe déjà`,
        );
      }
    }

    return this.prisma.filiere.update({
      where: { id },
      data: {
        code: dto.code?.trim().toUpperCase(),
        nom: dto.nom?.trim(),
        description: dto.description?.trim(),
        actif: dto.actif,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const formations = await this.prisma.formation.count({
      where: {
        filiereId: id,
      },
    });

    if (formations > 0) {
      throw new ConflictException(
        'Impossible de supprimer cette filière car elle possède des formations',
      );
    }

    return this.prisma.filiere.delete({
      where: { id },
    });
  }
}