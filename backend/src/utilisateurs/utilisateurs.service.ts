import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto.js';

@Injectable()
export class UtilisateursService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private readonly permissionDefinitions = [
    ['PROFIL_LIRE', 'Consulter son profil'],
    ['REFERENTIEL_CONSULTER', 'Consulter le référentiel académique'],
    ['REFERENTIEL_GERER', 'Gérer le référentiel académique'],
    ['ENSEIGNEMENTS_CONSULTER', 'Consulter les enseignements'],
    ['ENSEIGNEMENTS_GERER', 'Gérer les enseignements'],
    ['SEANCES_DECLARER', 'Déclarer les séances'],
    ['SEANCES_VALIDER', 'Valider les séances'],
    ['QHSE_CONSULTER', 'Consulter le suivi QHSE'],
    ['SCOLARITE_GERER', 'Gérer la scolarité'],
    ['ELIGIBILITE_CONSULTER', 'Consulter les éligibilités'],
    ['ELIGIBILITE_GERER', 'Gérer les validations académiques'],
    ['DIPLOME_DEMANDER', 'Demander un diplôme'],
    ['DIPLOMES_GERER', 'Gérer les diplômes'],
    ['REPORTING_CONSULTER', 'Consulter les rapports'],
    ['AUDIT_CONSULTER', 'Consulter le journal d audit'],
    ['UTILISATEURS_GERER', 'Gérer les utilisateurs'],
  ] as const;

  private readonly rolePermissions:
    Record<string, string[]> = {

      SUPER_ADMIN:
        this.permissionDefinitions.map(
          ([code]) => code,
        ),

      ADMIN: [
        'PROFIL_LIRE',
        'REFERENTIEL_CONSULTER',
        'REFERENTIEL_GERER',
        'ENSEIGNEMENTS_CONSULTER',
        'ENSEIGNEMENTS_GERER',
        'SCOLARITE_GERER',
        'REPORTING_CONSULTER',
              'UTILISATEURS_GERER',
      ],

      ETUDIANT: [
        'PROFIL_LIRE',
        'REFERENTIEL_CONSULTER',
        'DIPLOME_DEMANDER',
      ],


      ENSEIGNANT: [
        'PROFIL_LIRE',
        'REFERENTIEL_CONSULTER',
      ],

      PEDAGOGIE: [
        'PROFIL_LIRE',
        'REFERENTIEL_CONSULTER',
        'ENSEIGNEMENTS_CONSULTER',
        'SEANCES_VALIDER',
        'ELIGIBILITE_CONSULTER',
        'ELIGIBILITE_GERER',
        'REPORTING_CONSULTER',
      ],

      QHSE: [
        'PROFIL_LIRE',
        'QHSE_CONSULTER',
        'REPORTING_CONSULTER',
      ],

      SCOLARITE: [
        'PROFIL_LIRE',
        'SCOLARITE_GERER',
        'ELIGIBILITE_CONSULTER',
      ],

      DIPLOMES: [
        'PROFIL_LIRE',
        'ELIGIBILITE_CONSULTER',
        'DIPLOMES_GERER',
      ],

      COORDONNATEUR: [
        'PROFIL_LIRE',
        'REFERENTIEL_CONSULTER',
        'ENSEIGNEMENTS_CONSULTER',
        'ENSEIGNEMENTS_GERER',
        'REPORTING_CONSULTER',
      ],
    };

  private readonly roleNames:
    Record<string, string> = {

      SUPER_ADMIN:
        'Super administrateur',

      ADMIN:
        'Administrateur',

      ETUDIANT:
        'Etudiant',

      ENSEIGNANT:
        'Enseignant',

      PEDAGOGIE:
        'Responsable pédagogique',

      QHSE:
        'Responsable QHSE',

      SCOLARITE:
        'Scolarité',

      DIPLOMES:
        'Service diplômes',

      COORDONNATEUR:
        'Coordonnateur',
    };

  async initialiserReferentiel() {
    for (
      const [code, nom]
      of this.permissionDefinitions
    ) {
      await this.prisma.permission.upsert({
        where: {
          code,
        },

        update: {
          nom,
        },

        create: {
          code,
          nom,
        },
      });
    }

    for (
      const [
        roleCode,
        permissionCodes,
      ]
      of Object.entries(
        this.rolePermissions,
      )
    ) {
      const role =
        await this.prisma.role.upsert({
          where: {
            code: roleCode,
          },

          update: {
            nom:
              this.roleNames[
                roleCode
              ] ?? roleCode,

            actif: true,
          },

          create: {
            code: roleCode,

            nom:
              this.roleNames[
                roleCode
              ] ?? roleCode,
          },
        });

      for (
        const permissionCode
        of permissionCodes
      ) {
        const permission =
          await this.prisma.permission
            .findUnique({
              where: {
                code:
                  permissionCode,
              },
            });

        if (!permission) {
          continue;
        }

        await this.prisma
          .rolePermission
          .upsert({
            where: {
              roleId_permissionId: {
                roleId:
                  role.id,

                permissionId:
                  permission.id,
              },
            },

            update: {},

            create: {
              roleId:
                role.id,

              permissionId:
                permission.id,
            },
          });
      }
    }

    return {
      message:
        'Référentiel de sécurité initialisé',
    };
  }


  async synchroniserStrictementReferentiel() {
    await this.initialiserReferentiel();

    for (
      const [
        roleCode,
        permissionCodes,
      ]
      of Object.entries(
        this.rolePermissions,
      )
    ) {
      const role =
        await this.prisma.role.findUnique({
          where: {
            code: roleCode,
          },
        });

      if (!role) {
        continue;
      }

      const permissions =
        await this.prisma.permission.findMany({
          where: {
            code: {
              in: permissionCodes,
            },
          },

          select: {
            id: true,
          },
        });

      const ids =
        permissions.map(
          (permission) =>
            permission.id,
        );

      await this.prisma
        .rolePermission
        .deleteMany({
          where: {
            roleId:
              role.id,

            ...(ids.length > 0
              ? {
                  permissionId: {
                    notIn: ids,
                  },
                }
              : {}),
          },
        });
    }

    return {
      message:
        'Matrice de sécurité synchronisée strictement',
    };
  }
  async bootstrap(
    email: string,
    motDePasse: string,
    nomAffichage?: string,
  ) {
    const nombreUtilisateurs =
      await this.prisma
        .utilisateur
        .count();

    if (nombreUtilisateurs > 0) {
      throw new ConflictException(
        'Le compte initial a déjà été créé',
      );
    }

    await this.initialiserReferentiel();

    const role =
      await this.prisma.role.findUnique({
        where: {
          code: 'SUPER_ADMIN',
        },
      });

    if (!role) {
      throw new ConflictException(
        'Role SUPER_ADMIN introuvable',
      );
    }

    const hash =
      await bcrypt.hash(
        motDePasse,
        12,
      );

    const user =
      await this.prisma.utilisateur.create({
        data: {
          email:
            email.trim().toLowerCase(),

          motDePasseHash:
            hash,

          nomAffichage,

          roles: {
            create: {
              roleId:
                role.id,
            },
          },
        },
      });

    return {
      id:
        user.id,

      email:
        user.email,

      nomAffichage:
        user.nomAffichage,

      roles: [
        'SUPER_ADMIN',
      ],
    };
  }

  async findForAuth(
    email: string,
  ) {
    return this.prisma
      .utilisateur
      .findUnique({
        where: {
          email:
            email
              .trim()
              .toLowerCase(),
        },

        include: {
          etudiant: true,
          enseignant: true,

          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission:
                        true,
                    },
                  },
                },
              },
            },
          },
        },
      });
  }

  async findForJwt(
    id: number,
  ) {
    return this.prisma
      .utilisateur
      .findUnique({
        where: {
          id,
        },

        include: {
          etudiant: true,
          enseignant: true,

          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission:
                        true,
                    },
                  },
                },
              },
            },
          },
        },
      });
  }

  private formatter(
    user: any,
  ) {
    return {
      id:
        user.id,

      email:
        user.email,

      nomAffichage:
        user.nomAffichage,

      actif:
        user.actif,

      derniereConnexion:
        user.derniereConnexion,

      etudiant:
        user.etudiant ?? null,

      enseignant:
        user.enseignant ?? null,

      roles:
        user.roles?.map(
          (item: any) =>
            item.role.code,
        ) ?? [],
    };
  }

  async findAll() {
    const users =
      await this.prisma
        .utilisateur
        .findMany({
          include: {
            etudiant: true,
            enseignant: true,

            roles: {
              include: {
                role: true,
              },
            },
          },

          orderBy: {
            email: 'asc',
          },
        });

    return users.map(
      (user) =>
        this.formatter(user),
    );
  }

  async findOne(
    id: number,
  ) {
    const user =
      await this.prisma
        .utilisateur
        .findUnique({
          where: {
            id,
          },

          include: {
            etudiant: true,
            enseignant: true,

            roles: {
              include: {
                role: true,
              },
            },
          },
        });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur ${id} introuvable`,
      );
    }

    return this.formatter(user);
  }

  async create(
    dto: CreateUtilisateurDto,
  ) {
    if (
      dto.etudiantId &&
      dto.enseignantId
    ) {
      throw new ConflictException(
        'Un compte ne peut pas être simultanément étudiant et enseignant',
      );
    }

    const email =
      dto.email
        .trim()
        .toLowerCase();

    const emailExiste =
      await this.prisma
        .utilisateur
        .findUnique({
          where: {
            email,
          },
        });

    if (emailExiste) {
      throw new ConflictException(
        'Cette adresse email possède déjà un compte',
      );
    }

    if (dto.etudiantId) {
      const etudiant =
        await this.prisma
          .etudiant
          .findUnique({
            where: {
              id:
                dto.etudiantId,
            },

            include: {
              utilisateur:
                true,
            },
          });

      if (!etudiant) {
        throw new NotFoundException(
          'Etudiant introuvable',
        );
      }

      if (etudiant.utilisateur) {
        throw new ConflictException(
          'Cet étudiant possède déjà un compte',
        );
      }
    }

    if (dto.enseignantId) {
      const enseignant =
        await this.prisma
          .enseignant
          .findUnique({
            where: {
              id:
                dto.enseignantId,
            },

            include: {
              utilisateur:
                true,
            },
          });

      if (!enseignant) {
        throw new NotFoundException(
          'Enseignant introuvable',
        );
      }

      if (enseignant.utilisateur) {
        throw new ConflictException(
          'Cet enseignant possède déjà un compte',
        );
      }
    }

    const codes =
      dto.roles?.map(
        (role) =>
          role
            .trim()
            .toUpperCase(),
      ) ?? [];

    const roles =
      codes.length > 0
        ? await this.prisma.role.findMany({
            where: {
              code: {
                in: codes,
              },
            },
          })
        : [];

    if (
      roles.length !==
      codes.length
    ) {
      throw new NotFoundException(
        'Un ou plusieurs rôles sont invalides',
      );
    }

    const hash =
      await bcrypt.hash(
        dto.motDePasse,
        12,
      );

    const user =
      await this.prisma
        .utilisateur
        .create({
          data: {
            email,

            motDePasseHash:
              hash,

            nomAffichage:
              dto.nomAffichage,

            etudiantId:
              dto.etudiantId,

            enseignantId:
              dto.enseignantId,

            roles: {
              create:
                roles.map(
                  (role) => ({
                    roleId:
                      role.id,
                  }),
                ),
            },
          },

          include: {
            etudiant: true,
            enseignant: true,

            roles: {
              include: {
                role: true,
              },
            },
          },
        });

    return this.formatter(user);
  }

  async attribuerRole(
    utilisateurId: number,
    roleCode: string,
  ) {
    await this.findOne(
      utilisateurId,
    );

    const role =
      await this.prisma
        .role
        .findUnique({
          where: {
            code:
              roleCode
                .trim()
                .toUpperCase(),
          },
        });

    if (!role) {
      throw new NotFoundException(
        'Role introuvable',
      );
    }

    await this.prisma
      .utilisateurRole
      .upsert({
        where: {
          utilisateurId_roleId: {
            utilisateurId,

            roleId:
              role.id,
          },
        },

        update: {},

        create: {
          utilisateurId,

          roleId:
            role.id,
        },
      });

    return this.findOne(
      utilisateurId,
    );
  }

  async retirerRole(
    utilisateurId: number,
    roleCode: string,
  ) {
    const role =
      await this.prisma
        .role
        .findUnique({
          where: {
            code:
              roleCode
                .trim()
                .toUpperCase(),
          },
        });

    if (!role) {
      throw new NotFoundException(
        'Role introuvable',
      );
    }

    await this.prisma
      .utilisateurRole
      .deleteMany({
        where: {
          utilisateurId,

          roleId:
            role.id,
        },
      });

    return this.findOne(
      utilisateurId,
    );
  }

  async setActif(
    id: number,
    actif: boolean,
  ) {
    await this.findOne(id);

    const user =
      await this.prisma
        .utilisateur
        .update({
          where: {
            id,
          },

          data: {
            actif,
          },

          include: {
            etudiant: true,
            enseignant: true,

            roles: {
              include: {
                role: true,
              },
            },
          },
        });

    return this.formatter(user);
  }

  async roles() {
    return this.prisma.role
      .findMany({
        include: {
          permissions: {
            include: {
              permission:
                true,
            },
          },
        },

        orderBy: {
          code: 'asc',
        },
      });
  }

  async listerPermissions() {
    return this.prisma.permission
      .findMany({
        orderBy: {
          code: 'asc',
        },
      });
  }
}
