import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { EligibiliteService } from './eligibilite.service.js';
import { CreateValidationAcademiqueDto } from './dto/create-validation-academique.dto.js';
import { UpdateValidationAcademiqueDto } from './dto/update-validation-academique.dto.js';

@Controller('eligibilite')
export class EligibiliteController {
  constructor(
    private readonly service:
      EligibiliteService,
  ) {}

  /*
   * ESPACE ETUDIANT
   *
   * L'étudiant ne donne aucun ID d'étudiant.
   * Son identité provient du JWT.
   */

  @Permissions('PROFIL_LIRE')
  @Roles('ETUDIANT')
  @Get('me')
  me(
    @Req()
    request: any,
  ) {
    const etudiantId =
      request.user?.etudiant?.id;

    if (!etudiantId) {
      throw new ForbiddenException(
        'Aucun profil étudiant associé à ce compte',
      );
    }

    return this.service
      .evaluerEtudiant(
        etudiantId,
      );
  }

  /*
   * PEDAGOGIE
   */

  @Permissions('ELIGIBILITE_GERER')
  @Post('validations')
  creerValidation(
    @Body()
    dto: CreateValidationAcademiqueDto,
  ) {
    return this.service
      .creerValidation(dto);
  }

  @Permissions('ELIGIBILITE_GERER')
  @Patch('validations/:id')
  updateValidation(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateValidationAcademiqueDto,
  ) {
    return this.service
      .updateValidation(
        id,
        dto,
      );
  }

  /*
   * CONSULTATION INTERNE
   */

  @Permissions('ELIGIBILITE_CONSULTER')
  @Get('inscription/:id')
  evaluerInscription(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .evaluerInscription(id);
  }

  @Permissions('ELIGIBILITE_CONSULTER')
  @Get('etudiant/:id')
  evaluerEtudiant(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .evaluerEtudiant(id);
  }

  @Permissions('ELIGIBILITE_CONSULTER')
  @Get('matricule/:matricule')
  evaluerMatricule(
    @Param('matricule')
    matricule: string,
  ) {
    return this.service
      .evaluerMatricule(
        matricule,
      );
  }

  @Permissions('ELIGIBILITE_CONSULTER')
  @Get('eligibles')
  eligibles() {
    return this.service
      .listeEligibles();
  }

  @Permissions('ELIGIBILITE_CONSULTER')
  @Get('non-eligibles')
  nonEligibles() {
    return this.service
      .listeNonEligibles();
  }
}
