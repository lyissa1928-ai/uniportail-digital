import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import { UtilisateursService } from '../utilisateurs/utilisateurs.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    configService: ConfigService,

    private readonly utilisateurs:
      UtilisateursService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration:
        false,

      secretOrKey:
        configService.getOrThrow<string>(
          'JWT_SECRET',
        ),
    });
  }

  async validate(
    payload: {
      sub: number;
      email: string;
    },
  ) {
    const user =
      await this.utilisateurs
        .findForJwt(
          payload.sub,
        );

    if (
      !user ||
      !user.actif
    ) {
      throw new UnauthorizedException(
        'Compte invalide ou désactivé',
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

    return {
      id:
        user.id,

      email:
        user.email,

      nomAffichage:
        user.nomAffichage,

      roles,

      permissions,

      etudiant:
        user.etudiant,

      enseignant:
        user.enseignant,
    };
  }
}
