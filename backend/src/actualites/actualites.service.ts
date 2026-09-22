import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  mkdir,
  readFile,
  unlink,
  writeFile,
} from 'node:fs/promises';

import {
  basename,
  join,
  resolve,
} from 'node:path';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  CreateActualiteDto,
} from './dto/create-actualite.dto.js';

import {
  UpdateActualiteDto,
} from './dto/update-actualite.dto.js';

type CurrentUser = {
  id: number;
  email?: string;
  nomAffichage?: string | null;
  roles?: string[];
};

type SourceActualiteValue =
  | 'PEDAGOGIE'
  | 'SCOLARITE'
  | 'ADMINISTRATION';

@Injectable()
export class ActualitesService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly config:
      ConfigService,
  ) {}

  private uploadDir() {
    return resolve(
      this.config.get<string>(
        'ACTUALITES_UPLOAD_DIR',
      ) ??
      '/opt/suivi-evaluations/uploads/actualites',
    );
  }

  private sourceFromUser(
    user:
      CurrentUser,
  ): SourceActualiteValue {
    const roles =
      user.roles ??
      [];

    if (
      roles.includes(
        'PEDAGOGIE',
      )
    ) {
      return 'PEDAGOGIE';
    }

    if (
      roles.includes(
        'SCOLARITE',
      )
    ) {
      return 'SCOLARITE';
    }

    return 'ADMINISTRATION';
  }

  private canEdit(
    item: {
      auteurId:
        number;
    },
    user:
      CurrentUser,
  ) {
    const roles =
      user.roles ??
      [];

    return (
      item.auteurId ===
        user.id ||
      roles.includes(
        'SUPER_ADMIN',
      ) ||
      roles.includes(
        'ADMIN',
      )
    );
  }

  private validateDates(
    start:
      Date,
    end:
      Date,
  ) {
    if (
      Number.isNaN(
        start.getTime(),
      ) ||
      Number.isNaN(
        end.getTime(),
      )
    ) {
      throw new BadRequestException(
        'Dates invalides',
      );
    }

    if (
      end <=
      start
    ) {
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début',
      );
    }
  }

  async publicList(
    limit =
      3,
  ) {
    const now =
      new Date();

    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) ||
            3,
          1,
        ),
        12,
      );

    return this.prisma
      .actualite
      .findMany({
        where: {
          publiee:
            true,

          dateDebut: {
            lte:
              now,
          },

          dateFin: {
            gt:
              now,
          },
        },

        orderBy: [
          {
            dateDebut:
              'desc',
          },

          {
            createdAt:
              'desc',
          },
        ],

        take:
          safeLimit,

        select: {
          id:
            true,
          titre:
            true,
          resume:
            true,
          contenu:
            true,
          imageUrl:
            true,
          source:
            true,
          dateDebut:
            true,
          dateFin:
            true,
          createdAt:
            true,
          auteur: {
            select: {
              nomAffichage:
                true,
            },
          },
        },
      });
  }

  async list() {
    return this.prisma
      .actualite
      .findMany({
        orderBy: [
          {
            createdAt:
              'desc',
          },
        ],

        take:
          100,

        include: {
          auteur: {
            select: {
              id:
                true,
              email:
                true,
              nomAffichage:
                true,
            },
          },
        },
      });
  }

  async create(
    dto:
      CreateActualiteDto,
    user:
      CurrentUser,
  ) {
    const start =
      dto.dateDebut
        ? new Date(
            dto.dateDebut,
          )
        : new Date();

    const end =
      new Date(
        dto.dateFin,
      );

    this.validateDates(
      start,
      end,
    );

    return this.prisma
      .actualite
      .create({
        data: {
          titre:
            dto.titre.trim(),

          resume:
            dto.resume.trim(),

          contenu:
            dto.contenu
              ?.trim() ||
            null,

          source:
            this.sourceFromUser(
              user,
            ),

          publiee:
            dto.publiee ??
            true,

          dateDebut:
            start,

          dateFin:
            end,

          auteurId:
            user.id,
        },

        include: {
          auteur: {
            select: {
              id:
                true,
              email:
                true,
              nomAffichage:
                true,
            },
          },
        },
      });
  }

  async update(
    id:
      number,
    dto:
      UpdateActualiteDto,
    user:
      CurrentUser,
  ) {
    const current =
      await this.prisma
        .actualite
        .findUnique({
          where: {
            id,
          },
        });

    if (!current) {
      throw new NotFoundException(
        'Actualité introuvable',
      );
    }

    if (
      !this.canEdit(
        current,
        user,
      )
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres actualités',
      );
    }

    const start =
      dto.dateDebut
        ? new Date(
            dto.dateDebut,
          )
        : current.dateDebut;

    const end =
      dto.dateFin
        ? new Date(
            dto.dateFin,
          )
        : current.dateFin;

    this.validateDates(
      start,
      end,
    );

    return this.prisma
      .actualite
      .update({
        where: {
          id,
        },

        data: {
          titre:
            dto.titre ===
            undefined
              ? undefined
              : dto.titre.trim(),

          resume:
            dto.resume ===
            undefined
              ? undefined
              : dto.resume.trim(),

          contenu:
            dto.contenu ===
            undefined
              ? undefined
              : dto.contenu
                  .trim() ||
                null,

          dateDebut:
            dto.dateDebut
              ? start
              : undefined,

          dateFin:
            dto.dateFin
              ? end
              : undefined,

          publiee:
            dto.publiee,
        },

        include: {
          auteur: {
            select: {
              id:
                true,
              email:
                true,
              nomAffichage:
                true,
            },
          },
        },
      });
  }

  async remove(
    id:
      number,
    user:
      CurrentUser,
  ) {
    const current =
      await this.prisma
        .actualite
        .findUnique({
          where: {
            id,
          },
        });

    if (!current) {
      throw new NotFoundException(
        'Actualité introuvable',
      );
    }

    if (
      !this.canEdit(
        current,
        user,
      )
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez retirer que vos propres actualités',
      );
    }

    if (
      current.imageUrl
        ?.startsWith(
          '/api/actualites/assets/',
        )
    ) {
      const filename =
        basename(
          current.imageUrl,
        );

      await unlink(
        join(
          this.uploadDir(),
          filename,
        ),
      ).catch(
        () =>
          undefined,
      );
    }

    await this.prisma
      .actualite
      .delete({
        where: {
          id,
        },
      });

    return {
      success:
        true,
    };
  }

  async saveImage(
    id:
      number,
    file:
      any,
    user:
      CurrentUser,
  ) {
    const current =
      await this.prisma
        .actualite
        .findUnique({
          where: {
            id,
          },
        });

    if (!current) {
      throw new NotFoundException(
        'Actualité introuvable',
      );
    }

    if (
      !this.canEdit(
        current,
        user,
      )
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres actualités',
      );
    }

    if (
      !file ||
      !Buffer.isBuffer(
        file.buffer,
      )
    ) {
      throw new BadRequestException(
        'Fichier image obligatoire',
      );
    }

    const extensions:
      Record<
        string,
        string
      > = {
        'image/png':
          'png',
        'image/jpeg':
          'jpg',
        'image/webp':
          'webp',
      };

    const extension =
      extensions[
        file.mimetype
      ];

    if (!extension) {
      throw new BadRequestException(
        'Format autorisé : PNG, JPG ou WEBP',
      );
    }

    const directory =
      this.uploadDir();

    await mkdir(
      directory,
      {
        recursive:
          true,
      },
    );

    if (
      current.imageUrl
        ?.startsWith(
          '/api/actualites/assets/',
        )
    ) {
      await unlink(
        join(
          directory,
          basename(
            current.imageUrl,
          ),
        ),
      ).catch(
        () =>
          undefined,
      );
    }

    const filename =
      `actualite-${id}-${Date.now()}.${extension}`;

    await writeFile(
      join(
        directory,
        filename,
      ),
      file.buffer,
      {
        mode:
          0o640,
      },
    );

    return this.prisma
      .actualite
      .update({
        where: {
          id,
        },

        data: {
          imageUrl:
            `/api/actualites/assets/${filename}`,
        },

        include: {
          auteur: {
            select: {
              id:
                true,
              email:
                true,
              nomAffichage:
                true,
            },
          },
        },
      });
  }

  async readAsset(
    filename:
      string,
  ) {
    if (
      !/^actualite-\d+-\d+\.(png|jpg|webp)$/
        .test(
          filename,
        )
    ) {
      throw new NotFoundException(
        'Ressource introuvable',
      );
    }

    try {
      const buffer =
        await readFile(
          join(
            this.uploadDir(),
            filename,
          ),
        );

      const extension =
        filename
          .split('.')
          .pop();

      return {
        buffer,

        contentType:
          extension ===
          'png'
            ? 'image/png'
            : extension ===
              'webp'
              ? 'image/webp'
              : 'image/jpeg',
      };
    }
    catch {
      throw new NotFoundException(
        'Ressource introuvable',
      );
    }
  }
}
