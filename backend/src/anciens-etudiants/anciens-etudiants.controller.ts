import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';

import {
  Throttle,
} from '@nestjs/throttler';

import type {
  Response,
} from 'express';

import {
  Public,
} from '../auth/decorators/public.decorator.js';

import {
  Permissions,
} from '../auth/decorators/permissions.decorator.js';

import {
  AnciensEtudiantsService,
} from './anciens-etudiants.service.js';

import {
  CreateDemandeAncienEtudiantDto,
} from './dto/create-demande-ancien-etudiant.dto.js';

import {
  SuiviDemandeAncienEtudiantDto,
} from './dto/suivi-demande-ancien-etudiant.dto.js';

import {
  MotifDemandeAncienEtudiantDto,
  ValiderDemandeAncienEtudiantDto,
} from './dto/traitement-demande-ancien-etudiant.dto.js';

@Controller('anciens-etudiants')
export class AnciensEtudiantsController {
  constructor(
    private readonly service:
      AnciensEtudiantsService,
  ) {}

  @Public()
  @Throttle({
    default: {
      limit: 4,
      ttl: 60000,
    },
  })
  @Post('public/demandes')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'identite',
          maxCount: 1,
        },
        {
          name: 'pieces',
          maxCount: 6,
        },
      ],
      {
        limits: {
          fileSize:
            8 * 1024 * 1024,
          files: 7,
        },
      },
    ),
  )
  creerDemandePublique(
    @Body()
    dto:
      CreateDemandeAncienEtudiantDto,

    @UploadedFiles()
    files: {
      identite?: any[];
      pieces?: any[];
    },
  ) {
    return this.service
      .creerDemandePublique(
        dto,
        files,
      );
  }

  @Public()
  @Throttle({
    default: {
      limit: 20,
      ttl: 60000,
    },
  })
  @Post('public/suivre')
  suivre(
    @Body()
    dto:
      SuiviDemandeAncienEtudiantDto,
  ) {
    return this.service
      .suivreDemande(
        dto,
      );
  }

  @Permissions(
    'SCOLARITE_GERER',
  )
  @Get('demandes')
  demandes(
    @Query('statut')
    statut?: string,
  ) {
    return this.service
      .demandes(statut);
  }

  @Permissions(
    'SCOLARITE_GERER',
  )
  @Get('demandes/:id')
  demande(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .demande(id);
  }

  @Permissions(
    'SCOLARITE_GERER',
  )
  @Get(
    'demandes/:id/pieces/:pieceId',
  )
  async piece(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Param(
      'pieceId',
      ParseIntPipe,
    )
    pieceId: number,

    @Res({
      passthrough:
        true,
    })
    response:
      Response,
  ) {
    const piece =
      await this.service
        .lirePiece(
          id,
          pieceId,
        );

    response.setHeader(
      'Content-Type',
      piece.mimeType,
    );

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="' +
        piece.nomTelechargement +
        '"',
    );

    response.setHeader(
      'Cache-Control',
      'private, no-store',
    );

    return new StreamableFile(
      piece.buffer,
    );
  }

  @Permissions(
    'SCOLARITE_GERER',
  )
  @Patch(
    'demandes/:id/verifier',
  )
  verifier(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: any,
  ) {
    return this.service
      .mettreEnVerification(
        id,
        request.user
          ?.email,
      );
  }

  @Permissions(
    'SCOLARITE_GERER',
  )
  @Patch(
    'demandes/:id/complement',
  )
  complement(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto:
      MotifDemandeAncienEtudiantDto,

    @Req()
    request: any,
  ) {
    return this.service
      .demanderComplement(
        id,
        dto.motif,
        request.user
          ?.email,
      );
  }

  @Permissions(
    'SCOLARITE_GERER',
  )
  @Patch(
    'demandes/:id/rejeter',
  )
  rejeter(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto:
      MotifDemandeAncienEtudiantDto,

    @Req()
    request: any,
  ) {
    return this.service
      .rejeter(
        id,
        dto.motif,
        request.user
          ?.email,
      );
  }

  @Permissions(
    'SCOLARITE_GERER',
  )
  @Patch(
    'demandes/:id/valider',
  )
  valider(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto:
      ValiderDemandeAncienEtudiantDto,

    @Req()
    request: any,
  ) {
    return this.service
      .valider(
        id,
        dto.matricule,
        request.user
          ?.email,
      );
  }
}
