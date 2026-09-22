import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  Permissions,
} from '../../auth/decorators/permissions.decorator.js';

import {
  ImportEtudiantsService,
} from './import-etudiants.service.js';

import {
  CreateEtudiantAvecCompteDto,
} from './dto/create-etudiant-avec-compte.dto.js';

import {
  ImportEtudiantsMetaDto,
} from './dto/import-etudiants-meta.dto.js';

@Controller('etudiants')
@Permissions('SCOLARITE_GERER')
export class ImportEtudiantsController {
  constructor(
    private readonly service:
      ImportEtudiantsService,
  ) {}

  @Post('avec-compte')
  creerIndividuellement(
    @Body()
    dto:
      CreateEtudiantAvecCompteDto,
  ) {
    return this.service
      .creerIndividuellement(
        dto,
      );
  }

  @Get('import/template')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header(
    'Content-Disposition',
    'attachment; filename="modele_import_etudiants.xlsx"',
  )
  async template() {
    const buffer =
      await this.service
        .genererTemplate();

    return new StreamableFile(
      buffer,
    );
  }

  @Post('import/analyser')
  @UseInterceptors(
    FileInterceptor(
      'fichier',
      {
        limits: {
          fileSize:
            5 * 1024 * 1024,
        },
      },
    ),
  )
  analyser(
    @UploadedFile()
    file: {
      buffer: Buffer;
      originalname: string;
      size: number;
    },

    @Body()
    meta:
      ImportEtudiantsMetaDto,
  ) {
    return this.service
      .analyser(
        file,
        meta,
      );
  }

  @Post('import/confirmer')
  @UseInterceptors(
    FileInterceptor(
      'fichier',
      {
        limits: {
          fileSize:
            5 * 1024 * 1024,
        },
      },
    ),
  )
  confirmer(
    @UploadedFile()
    file: {
      buffer: Buffer;
      originalname: string;
      size: number;
    },

    @Body()
    meta:
      ImportEtudiantsMetaDto,
  ) {
    return this.service
      .confirmer(
        file,
        meta,
      );
  }

  @Post(':id/renvoyer-acces')
  renvoyerAcces(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .renvoyerAcces(
        id,
      );
  }
}