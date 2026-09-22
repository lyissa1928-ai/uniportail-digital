import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';
import { UtilisateursService } from '../utilisateurs/utilisateurs.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService:
      JwtService,

    private readonly prisma:
      PrismaService,

    private readonly utilisateurs:
      UtilisateursService,
  ) {}

  async login(
    email: string,
    motDePasse: string,
  ) {
    const user =
      await this.utilisateurs
        .findForAuth(email);

    if (
      !user ||
      !user.actif
    ) {
      throw new UnauthorizedException(
        'Identifiants invalides',
      );
    }

    const passwordOK =
      await bcrypt.compare(
        motDePasse,
        user.motDePasseHash,
      );

    if (!passwordOK) {
      throw new UnauthorizedException(
        'Identifiants invalides',
      );
    }

    const roles =
      user.roles
        .filter(
          (item) =>
            item.role.actif,
        )
        .map(
          (item) =>
            item.role.code,
        );

    const permissions =
      Array.from(
        new Set(
          user.roles
            .filter(
              (item) =>
                item.role.actif,
            )
            .flatMap(
              (item) =>
                item.role.permissions
                  .map(
                    (rp) =>
                      rp.permission
                        .code,
                  ),
            ),
        ),
      );

    await this.prisma
      .utilisateur
      .update({
        where: {
          id:
            user.id,
        },

        data: {
          derniereConnexion:
            new Date(),
        },
      });

    const accessToken =
      await this.jwtService
        .signAsync({
          sub:
            user.id,

          email:
            user.email,
        });

    return {
      accessToken,

      tokenType:
        'Bearer',

      expiresIn:
        28800,

      utilisateur: {
        id:
          user.id,

        email:
          user.email,

        nomAffichage:
          user.nomAffichage,

        doitChangerMotDePasse:
          user.doitChangerMotDePasse,

        roles,

        permissions,

        etudiant:
          user.etudiant,

        enseignant:
          user.enseignant,
      },
    };
  }
}
