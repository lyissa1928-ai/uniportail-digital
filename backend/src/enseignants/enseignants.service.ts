import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEnseignantDto } from './dto/create-enseignant.dto.js';
import { UpdateEnseignantDto } from './dto/update-enseignant.dto.js';

@Injectable()
export class EnseignantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEnseignantDto) {
    const matricule = dto.matricule.trim().toUpperCase();

    const matriculeExiste =
      await this.prisma.enseignant.findUnique({
        where: {
          matricule,
        },
      });

    if (matriculeExiste) {
      throw new ConflictException(
        `Le matricule ${matricule} existe déjà`,
      );
    }

    if (dto.email) {
      const emailExiste =
        await this.prisma.enseignant.findUnique({
          where: {
            email: dto.email.trim().toLowerCase(),
          },
        });

      if (emailExiste) {
        throw new ConflictException(
          `L'adresse email ${dto.email} est déjà utilisée`,
        );
      }
    }

    return this.prisma.enseignant.create({
      data: {
        matricule,
        nom: dto.nom.trim().toUpperCase(),
        prenom: dto.prenom.trim(),
        email: dto.email?.trim().toLowerCase(),
        telephone: dto.telephone?.trim(),
        specialite: dto.specialite?.trim(),
        statut: dto.statut?.trim(),
        actif: dto.actif ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.enseignant.findMany({
      orderBy: [
        {
          nom: 'asc',
        },
        {
          prenom: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    const enseignant =
      await this.prisma.enseignant.findUnique({
        where: {
          id,
        },
      });

    if (!enseignant) {
      throw new NotFoundException(
        `Enseignant ${id} introuvable`,
      );
    }

    return enseignant;
  }

  async findByMatricule(matricule: string) {
    const enseignant =
      await this.prisma.enseignant.findUnique({
        where: {
          matricule: matricule.trim().toUpperCase(),
        },
      });

    if (!enseignant) {
      throw new NotFoundException(
        `Enseignant ${matricule} introuvable`,
      );
    }

    return enseignant;
  }

  async search(terme: string) {
    return this.prisma.enseignant.findMany({
      where: {
        OR: [
          {
            nom: {
              contains: terme,
              mode: 'insensitive',
            },
          },
          {
            prenom: {
              contains: terme,
              mode: 'insensitive',
            },
          },
          {
            matricule: {
              contains: terme,
              mode: 'insensitive',
            },
          },
          {
            specialite: {
              contains: terme,
              mode: 'insensitive',
            },
          },
        ],
      },

      orderBy: {
        nom: 'asc',
      },
    });
  }

  async update(
    id: number,
    dto: UpdateEnseignantDto,
  ) {
    await this.findOne(id);

    if (dto.matricule) {
      const matricule =
        dto.matricule.trim().toUpperCase();

      const existing =
        await this.prisma.enseignant.findFirst({
          where: {
            matricule,
            NOT: {
              id,
            },
          },
        });

      if (existing) {
        throw new ConflictException(
          `Le matricule ${matricule} existe déjà`,
        );
      }
    }

    if (dto.email) {
      const email =
        dto.email.trim().toLowerCase();

      const existing =
        await this.prisma.enseignant.findFirst({
          where: {
            email,
            NOT: {
              id,
            },
          },
        });

      if (existing) {
        throw new ConflictException(
          `L'adresse email ${email} est déjà utilisée`,
        );
      }
    }

    return this.prisma.enseignant.update({
      where: {
        id,
      },

      data: {
        matricule:
          dto.matricule?.trim().toUpperCase(),

        nom:
          dto.nom?.trim().toUpperCase(),

        prenom:
          dto.prenom?.trim(),

        email:
          dto.email?.trim().toLowerCase(),

        telephone:
          dto.telephone?.trim(),

        specialite:
          dto.specialite?.trim(),

        statut:
          dto.statut?.trim(),

        actif:
          dto.actif,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.enseignant.delete({
      where: {
        id,
      },
    });
  }
}
