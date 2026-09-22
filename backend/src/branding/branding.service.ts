import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  mkdir,
  readdir,
  readFile,
  unlink,
  writeFile,
} from 'node:fs/promises';

import {
  join,
  resolve,
} from 'node:path';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  UpdateBrandingDto,
} from './dto/update-branding.dto.js';

const DEFAULTS = {
  id: 1,
  appName:
    'UniPortail Digital',
  appSubtitle:
    'Suivi & Évaluation Académique',
  heroTitle:
    'Un suivi rigoureux pour une réussite durable',
  heroDescription:
    'UniPortail Digital centralise la gestion des enseignements, des évaluations, de la scolarité et des diplômes dans une interface unique, sécurisée et collaborative.',
  quoteText:
    'L’enseignement est la clé qui ouvre les portes d’un avenir meilleur.',
  logoUrl:
    '/images/uniportail-logo.webp',
  heroImageUrl:
    '/images/login-campus.webp',
};

@Injectable()
export class BrandingService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly config:
      ConfigService,
  ) {}

  private uploadDir() {
    return resolve(
      this.config.get<string>(
        'BRANDING_UPLOAD_DIR',
      ) ??
      '/opt/suivi-evaluations/uploads/branding',
    );
  }

  private async ensureRow() {
    return this.prisma
      .brandingSettings
      .upsert({
        where: {
          id: 1,
        },

        update: {},

        create: {
          ...DEFAULTS,
        },
      });
  }

  async getPublic() {
    const row =
      await this.ensureRow();

    return {
      appName:
        row.appName,
      appSubtitle:
        row.appSubtitle,
      heroTitle:
        row.heroTitle,
      heroDescription:
        row.heroDescription,
      quoteText:
        row.quoteText,
      logoUrl:
        row.logoUrl ??
        DEFAULTS.logoUrl,
      heroImageUrl:
        row.heroImageUrl ??
        DEFAULTS.heroImageUrl,
    };
  }

  async getAdmin() {
    return this.ensureRow();
  }

  async update(
    dto:
      UpdateBrandingDto,
    actor?: string,
  ) {
    const clean = (
      value?: string,
    ) =>
      value === undefined
        ? undefined
        : value.trim();

    await this.ensureRow();

    return this.prisma
      .brandingSettings
      .update({
        where: {
          id: 1,
        },

        data: {
          appName:
            clean(
              dto.appName,
            ),

          appSubtitle:
            clean(
              dto.appSubtitle,
            ),

          heroTitle:
            clean(
              dto.heroTitle,
            ),

          heroDescription:
            clean(
              dto.heroDescription,
            ),

          quoteText:
            clean(
              dto.quoteText,
            ),

          updatedBy:
            actor,
        },
      });
  }

  async saveAsset(
    kind:
      'logo' |
      'hero',
    file: any,
    actor?: string,
  ) {
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

    const existing =
      await readdir(
        directory,
      );

    await Promise.all(
      existing
        .filter(
          (name) =>
            name.startsWith(
              `${kind}.`,
            ),
        )
        .map(
          (name) =>
            unlink(
              join(
                directory,
                name,
              ),
            ).catch(
              () =>
                undefined,
            ),
        ),
    );

    const filename =
      `${kind}.${extension}`;

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

    const url =
      `/api/branding/assets/${filename}`;

    await this.ensureRow();

    await this.prisma
      .brandingSettings
      .update({
        where: {
          id: 1,
        },

        data: {
          ...(kind ===
          'logo'
            ? {
                logoUrl:
                  url,
              }
            : {
                heroImageUrl:
                  url,
              }),

          updatedBy:
            actor,
        },
      });

    return this.getAdmin();
  }

  async readAsset(
    filename:
      string,
  ) {
    if (
      !/^(logo|hero)\.(png|jpg|webp)$/
        .test(
          filename,
        )
    ) {
      throw new NotFoundException(
        'Ressource introuvable',
      );
    }

    const fullPath =
      join(
        this.uploadDir(),
        filename,
      );

    try {
      const buffer =
        await readFile(
          fullPath,
        );

      const extension =
        filename
          .split('.')
          .pop();

      const contentType =
        extension ===
        'png'
          ? 'image/png'
          : extension ===
            'webp'
            ? 'image/webp'
            : 'image/jpeg';

      return {
        buffer,
        contentType,
      };
    }
    catch {
      throw new NotFoundException(
        'Ressource introuvable',
      );
    }
  }

  async restoreDefaults(
    actor?: string,
  ) {
    await this.ensureRow();

    return this.prisma
      .brandingSettings
      .update({
        where: {
          id: 1,
        },

        data: {
          appName:
            DEFAULTS.appName,
          appSubtitle:
            DEFAULTS.appSubtitle,
          heroTitle:
            DEFAULTS.heroTitle,
          heroDescription:
            DEFAULTS.heroDescription,
          quoteText:
            DEFAULTS.quoteText,
          logoUrl:
            DEFAULTS.logoUrl,
          heroImageUrl:
            DEFAULTS.heroImageUrl,
          updatedBy:
            actor,
        },
      });
  }
}
