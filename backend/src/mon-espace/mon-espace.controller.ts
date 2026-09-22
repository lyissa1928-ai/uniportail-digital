import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { CreateMaSeanceDto } from './dto/create-ma-seance.dto.js';
import { MonEspaceService } from './mon-espace.service.js';

@Controller('me')
@Permissions('PROFIL_LIRE')
export class MonEspaceController {
  constructor(
    private readonly service:
      MonEspaceService,
  ) {}

  @Get('profil')
  profil(
    @CurrentUser()
    user: any,
  ) {
    return this.service
      .profil(user);
  }

  /*
   * ETUDIANT
   */

  @Roles('ETUDIANT')
  @Get('etudiant/inscriptions')
  mesInscriptions(
    @CurrentUser()
    user: any,
  ) {
    return this.service
      .mesInscriptions(user);
  }

  @Roles('ETUDIANT')
  @Get('etudiant/eligibilite')
  monEligibilite(
    @CurrentUser()
    user: any,
  ) {
    return this.service
      .monEligibilite(user);
  }

  @Roles('ETUDIANT')
  @Get('etudiant/diplomes')
  mesDiplomes(
    @CurrentUser()
    user: any,
  ) {
    return this.service
      .mesDiplomes(user);
  }

  /*
   * ENSEIGNANT
   */

  @Roles('ENSEIGNANT')
  @Get('enseignant/affectations')
  mesAffectations(
    @CurrentUser()
    user: any,
  ) {
    return this.service
      .mesAffectations(user);
  }

  @Roles('ENSEIGNANT')
  @Get('enseignant/seances')
  mesSeances(
    @CurrentUser()
    user: any,
  ) {
    return this.service
      .mesSeances(user);
  }

  @Roles('ENSEIGNANT')
  @Post('enseignant/seances')
  declarerMaSeance(
    @CurrentUser()
    user: any,

    @Body()
    dto: CreateMaSeanceDto,
  ) {
    return this.service
      .declarerMaSeance(
        user,
        dto,
      );
  }
}
