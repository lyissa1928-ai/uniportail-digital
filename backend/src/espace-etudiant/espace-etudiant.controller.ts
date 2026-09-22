import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import {
  Permissions,
} from '../auth/decorators/permissions.decorator.js';

import {
  EspaceEtudiantService,
} from './espace-etudiant.service.js';

@Controller('me/etudiant')
@Permissions('PROFIL_LIRE')
export class EspaceEtudiantController {
  constructor(
    private readonly service:
      EspaceEtudiantService,
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

  @Get('soutenances')
  soutenances(
    @Req()
    request: any,
  ) {
    return this.service.soutenances(
      this.utilisateurId(
        request,
      ),
    );
  }
}