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

import { Public } from '../auth/decorators/public.decorator.js';
import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { DiplomesService } from './diplomes.service.js';
import { CreateDemandeDiplomeDto } from './dto/create-demande-diplome.dto.js';
import { MotifDiplomeDto } from './dto/motif-diplome.dto.js';
import { RetraitDiplomeDto } from './dto/retrait-diplome.dto.js';
import { PublicDiplomeLookupDto } from './dto/public-diplome-lookup.dto.js';
import { PublicDiplomeRequestDto } from './dto/public-diplome-request.dto.js';

@Controller('diplomes')
export class DiplomesController {
  constructor(
    private readonly service:
      DiplomesService,
  ) {}

  /*
   * ========================================================
   * ACCUEIL PUBLIC
   * ========================================================
   */

  @Public()
  @Post('public/verifier')
  verifierDisponibilitePublique(
    @Body()
    dto:
      PublicDiplomeLookupDto,
  ) {
    return this.service
      .verifierPublic(
        dto,
      );
  }

  @Public()
  @Post('public/demander')
  demanderDiplomePublic(
    @Body()
    dto:
      PublicDiplomeRequestDto,
  ) {
    return this.service
      .demanderPublic(
        dto,
      );
  }

  /*
   * ========================================================
   * ESPACE ETUDIANT
   * ========================================================
   */

  @Permissions('DIPLOME_DEMANDER')
  @Roles('ETUDIANT')
  @Post('mes-demandes')
  creerMaDemande(
    @Req()
    request: any,

    @Body()
    dto: CreateDemandeDiplomeDto,
  ) {
    const etudiantId =
      request.user?.etudiant?.id;

    if (!etudiantId) {
      throw new ForbiddenException(
        'Aucun profil étudiant associé à ce compte',
      );
    }

    return this.service
      .creerDemandeEtudiant(
        dto.inscriptionId,
        etudiantId,
      );
  }

  @Permissions('DIPLOME_DEMANDER')
  @Roles('ETUDIANT')
  @Get('mes-demandes')
  mesDemandes(
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
      .findByEtudiant(
        etudiantId,
      );
  }

  /*
   * ========================================================
   * SERVICE DIPLOMES
   * ========================================================
   */

  @Permissions('DIPLOMES_GERER')
  @Post('demandes')
  creerDemandeAdministration(
    @Body()
    dto: CreateDemandeDiplomeDto,
  ) {
    return this.service
      .creerDemande(dto);
  }

  @Permissions('DIPLOMES_GERER')
  @Get('demandes')
  findAll() {
    return this.service
      .findAll();
  }

  @Permissions('DIPLOMES_GERER')
  @Get('demandes/:id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .findOne(id);
  }

  @Permissions('DIPLOMES_GERER')
  @Get('etudiants/:id')
  byEtudiant(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .findByEtudiant(id);
  }

  @Permissions('DIPLOMES_GERER')
  @Get('matricule/:matricule')
  byMatricule(
    @Param('matricule')
    matricule: string,
  ) {
    return this.service
      .findByMatricule(
        matricule,
      );
  }

  @Permissions('DIPLOMES_GERER')
  @Patch('demandes/:id/verifier')
  verifier(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .mettreEnVerification(id);
  }

  @Permissions('DIPLOMES_GERER')
  @Patch('demandes/:id/correction')
  correction(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: MotifDiplomeDto,
  ) {
    return this.service
      .demanderCorrection(
        id,
        dto.motif,
      );
  }

  @Permissions('DIPLOMES_GERER')
  @Patch('demandes/:id/valider')
  valider(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .valider(id);
  }

  @Permissions('DIPLOMES_GERER')
  @Patch('demandes/:id/rejeter')
  rejeter(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: MotifDiplomeDto,
  ) {
    return this.service
      .rejeter(
        id,
        dto.motif,
      );
  }

  @Permissions('DIPLOMES_GERER')
  @Patch('demandes/:id/annuler')
  annuler(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .annuler(id);
  }

  @Permissions('DIPLOMES_GERER')
  @Post('demandes/:id/generer')
  generer(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .generer(id);
  }

  @Permissions('DIPLOMES_GERER')
  @Patch('demandes/:id/signer')
  signer(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .signer(id);
  }

  @Permissions('DIPLOMES_GERER')
  @Patch('demandes/:id/disponible')
  disponible(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.service
      .rendreDisponible(id);
  }

  @Permissions('DIPLOMES_GERER')
  @Patch('demandes/:id/retirer')
  retirer(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: RetraitDiplomeDto,
  ) {
    return this.service
      .retirer(
        id,
        dto.retirePar,
      );
  }

  @Permissions('DIPLOMES_GERER')
  @Get('disponibles/liste')
  disponibles() {
    return this.service
      .diplomesDisponibles();
  }

  @Permissions('DIPLOMES_GERER')
  @Get('retires/liste')
  retires() {
    return this.service
      .diplomesRetires();
  }
}
