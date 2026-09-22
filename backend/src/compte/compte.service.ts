import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  ChangerMotDePasseDto,
} from './dto/changer-mot-de-passe.dto.js';

@Injectable()
export class CompteService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  async securite(
    utilisateurId: number,
  ) {
    const utilisateur =
      await this.prisma
        .utilisateur
        .findUnique({
          where: {
            id: utilisateurId,
          },

          select: {
            id: true,
            email: true,
            actif: true,

            doitChangerMotDePasse:
              true,

            dateChangementMotDePasse:
              true,

            derniereConnexion:
              true,
          },
        });

    if (!utilisateur) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      );
    }

    return utilisateur;
  }

  async changerMotDePasse(
    utilisateurId: number,
    dto: ChangerMotDePasseDto,
  ) {
    if (
      dto.nouveauMotDePasse !==
      dto.confirmationMotDePasse
    ) {
      throw new BadRequestException(
        'La confirmation du nouveau mot de passe est incorrecte',
      );
    }

    const utilisateur =
      await this.prisma
        .utilisateur
        .findUnique({
          where: {
            id: utilisateurId,
          },
        });

    if (!utilisateur) {
      throw new NotFoundException(
        'Utilisateur introuvable',
      );
    }

    if (!utilisateur.actif) {
      throw new UnauthorizedException(
        'Compte utilisateur inactif',
      );
    }

    const ancienCorrect =
      await bcrypt.compare(
        dto.ancienMotDePasse,
        utilisateur.motDePasseHash,
      );

    if (!ancienCorrect) {
      throw new UnauthorizedException(
        'Mot de passe actuel incorrect',
      );
    }

    const identique =
      await bcrypt.compare(
        dto.nouveauMotDePasse,
        utilisateur.motDePasseHash,
      );

    if (identique) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit être différent du mot de passe actuel',
      );
    }

    const nouveauHash =
      await bcrypt.hash(
        dto.nouveauMotDePasse,
        12,
      );

    await this.prisma
      .utilisateur
      .update({
        where: {
          id: utilisateurId,
        },

        data: {
          motDePasseHash:
            nouveauHash,

          doitChangerMotDePasse:
            false,

          dateChangementMotDePasse:
            new Date(),
        },
      });

    return {
      message:
        'Mot de passe modifié avec succès',

      doitChangerMotDePasse:
        false,
    };
  }
}