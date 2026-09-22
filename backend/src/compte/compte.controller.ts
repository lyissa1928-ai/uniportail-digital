import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import {
  CompteService,
} from './compte.service.js';

import {
  ChangerMotDePasseDto,
} from './dto/changer-mot-de-passe.dto.js';

@Controller('compte')
export class CompteController {
  constructor(
    private readonly service:
      CompteService,
  ) {}

  private utilisateurId(
    request: any,
  ): number {
    const id =
      Number(
        request.user?.id ??
        request.user?.sub ??
        0,
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw new UnauthorizedException(
        'Utilisateur authentifié introuvable',
      );
    }

    return id;
  }

  @Get('securite')
  securite(
    @Req()
    request: any,
  ) {
    return this.service
      .securite(
        this.utilisateurId(
          request,
        ),
      );
  }

  @Patch('mot-de-passe')
  changerMotDePasse(
    @Req()
    request: any,

    @Body()
    dto:
      ChangerMotDePasseDto,
  ) {
    return this.service
      .changerMotDePasse(
        this.utilisateurId(
          request,
        ),
        dto,
      );
  }
}