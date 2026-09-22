import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import {
  Reflector,
} from '@nestjs/core';

@Injectable()
export class PermissionsGuard
  implements CanActivate
{
  constructor(
    private readonly reflector:
      Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const permissionsRequises =
      this.reflector
        .getAllAndOverride<
          string[]
        >(
          'permissions',
          [
            context.getHandler(),
            context.getClass(),
          ],
        );

    if (
      !permissionsRequises ||
      permissionsRequises.length === 0
    ) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest();

    const utilisateur =
      request.user;

    if (!utilisateur) {
      throw new ForbiddenException(
        'Utilisateur non authentifie',
      );
    }

    /*
     * SUPER_ADMIN dispose de tous
     * les droits fonctionnels.
     */
    const roles =
      Array.isArray(
        utilisateur.roles,
      )
        ? utilisateur.roles
        : [];

    const codesRoles =
      roles.map(
        (role: any) => {
          if (
            typeof role ===
            'string'
          ) {
            return role;
          }

          return (
            role.code ??
            role.nom ??
            role.role?.code ??
            role.role?.nom
          );
        },
      );

    if (
      codesRoles.includes(
        'SUPER_ADMIN',
      )
    ) {
      return true;
    }

    /*
     * Vérification normale
     * des permissions.
     */
    const permissions =
      Array.isArray(
        utilisateur.permissions,
      )
        ? utilisateur.permissions
        : [];

    const codesPermissions =
      permissions.map(
        (permission: any) => {
          if (
            typeof permission ===
            'string'
          ) {
            return permission;
          }

          return (
            permission.code ??
            permission.nom ??
            permission.permission
              ?.code ??
            permission.permission
              ?.nom
          );
        },
      );

    const autorise =
      permissionsRequises.every(
        (
          permissionRequise,
        ) =>
          codesPermissions.includes(
            permissionRequise,
          ),
      );

    if (!autorise) {
      throw new ForbiddenException(
        'Permission insuffisante',
      );
    }

    return true;
  }
}