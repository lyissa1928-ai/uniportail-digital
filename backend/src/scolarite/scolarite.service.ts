import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEtudiantDto } from './dto/create-etudiant.dto.js';
import { UpdateEtudiantDto } from './dto/update-etudiant.dto.js';
import { CreateInscriptionDto } from './dto/create-inscription.dto.js';
import { UpdateInscriptionDto } from './dto/update-inscription.dto.js';

@Injectable()
export class ScolariteService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private verifierAnnee(annee: string) {
    const [debut, fin] =
      annee.split('-').map(Number);

    if (fin !== debut + 1) {
      throw new ConflictException(
        "L'année académique doit être consécutive",
      );
    }
  }

  async createEtudiant(
    dto: CreateEtudiantDto,
  ) {
    const matricule =
      dto.matricule.trim().toUpperCase();

    const existe =
      await this.prisma.etudiant.findUnique({
        where: { matricule },
      });

    if (existe) {
      throw new ConflictException(
        `Le matricule ${matricule} existe déjà`,
      );
    }

    if (dto.email) {
      const email =
        dto.email.trim().toLowerCase();

      const emailExiste =
        await this.prisma.etudiant.findUnique({
          where: { email },
        });

      if (emailExiste) {
        throw new ConflictException(
          'Cette adresse email est déjà utilisée',
        );
      }
    }

    return this.prisma.etudiant.create({
      data: {
        matricule,
        nom: dto.nom.trim().toUpperCase(),
        prenom: dto.prenom.trim(),

        dateNaissance:
          dto.dateNaissance
            ? new Date(dto.dateNaissance)
            : undefined,

        email:
          dto.email?.trim().toLowerCase(),

        telephone:
          dto.telephone?.trim(),

        actif:
          dto.actif ?? true,
      },
    });
  }

  async findAllEtudiants() {
    return this.prisma.etudiant.findMany({
      include: {
        inscriptions: {
          include: {
            classe: {
              include: {
                niveau: {
                  include: {
                    formation: {
                      include: {
                        filiere: true,
                      },
                    },
                  },
                },
              },
            },
          },

          orderBy: {
            anneeAcademique: 'desc',
          },
        },
      },

      orderBy: [
        { nom: 'asc' },
        { prenom: 'asc' },
      ],
    });
  }

  async findEtudiant(id: number) {
    const etudiant =
      await this.prisma.etudiant.findUnique({
        where: { id },

        include: {
          inscriptions: {
            include: {
              classe: {
                include: {
                  niveau: {
                    include: {
                      formation: {
                        include: {
                          filiere: true,
                        },
                      },
                    },
                  },
                },
              },
            },

            orderBy: {
              anneeAcademique: 'desc',
            },
          },
        },
      });

    if (!etudiant) {
      throw new NotFoundException(
        `Etudiant ${id} introuvable`,
      );
    }

    return etudiant;
  }

  async findEtudiantByMatricule(
    matricule: string,
  ) {
    const etudiant =
      await this.prisma.etudiant.findUnique({
        where: {
          matricule:
            matricule.trim().toUpperCase(),
        },

        include: {
          inscriptions: {
            include: {
              classe: {
                include: {
                  niveau: {
                    include: {
                      formation: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!etudiant) {
      throw new NotFoundException(
        `Etudiant ${matricule} introuvable`,
      );
    }

    return etudiant;
  }

  async updateEtudiant(
    id: number,
    dto: UpdateEtudiantDto,
  ) {
    await this.findEtudiant(id);

    if (dto.matricule) {
      const matricule =
        dto.matricule
          .trim()
          .toUpperCase();

      const duplicate =
        await this.prisma.etudiant.findFirst({
          where: {
            matricule,
            NOT: { id },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Ce matricule existe déjà',
        );
      }
    }

    if (dto.email) {
      const email =
        dto.email.trim().toLowerCase();

      const duplicate =
        await this.prisma.etudiant.findFirst({
          where: {
            email,
            NOT: { id },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Cette adresse email existe déjà',
        );
      }
    }

    return this.prisma.etudiant.update({
      where: { id },

      data: {
        matricule:
          dto.matricule
            ?.trim()
            .toUpperCase(),

        nom:
          dto.nom
            ?.trim()
            .toUpperCase(),

        prenom:
          dto.prenom?.trim(),

        dateNaissance:
          dto.dateNaissance
            ? new Date(dto.dateNaissance)
            : undefined,

        email:
          dto.email
            ?.trim()
            .toLowerCase(),

        telephone:
          dto.telephone?.trim(),

        actif:
          dto.actif,
      },
    });
  }

  async removeEtudiant(id: number) {
    await this.findEtudiant(id);

    const inscriptions =
      await this.prisma
        .inscriptionEtudiant
        .count({
          where: {
            etudiantId: id,
          },
        });

    if (inscriptions > 0) {
      throw new ConflictException(
        "Impossible de supprimer un étudiant possédant un historique d'inscriptions",
      );
    }

    return this.prisma.etudiant.delete({
      where: { id },
    });
  }

  async createInscription(
    dto: CreateInscriptionDto,
  ) {
    this.verifierAnnee(
      dto.anneeAcademique,
    );

    const etudiant =
      await this.prisma.etudiant.findUnique({
        where: {
          id: dto.etudiantId,
        },
      });

    if (!etudiant) {
      throw new NotFoundException(
        `Etudiant ${dto.etudiantId} introuvable`,
      );
    }

    if (!etudiant.actif) {
      throw new ConflictException(
        "L'étudiant est inactif",
      );
    }

    const classe =
      await this.prisma.classe.findUnique({
        where: {
          id: dto.classeId,
        },
      });

    if (!classe) {
      throw new NotFoundException(
        `Classe ${dto.classeId} introuvable`,
      );
    }

    if (
      classe.annee !==
      dto.anneeAcademique
    ) {
      throw new ConflictException(
        `Cette classe appartient à l'année ${classe.annee}`,
      );
    }

    const existe =
      await this.prisma
        .inscriptionEtudiant
        .findFirst({
          where: {
            etudiantId:
              dto.etudiantId,

            anneeAcademique:
              dto.anneeAcademique,
          },
        });

    if (existe) {
      throw new ConflictException(
        "Cet étudiant possède déjà une inscription pour cette année académique",
      );
    }

    return this.prisma
      .inscriptionEtudiant
      .create({
        data: {
          etudiantId:
            dto.etudiantId,

          classeId:
            dto.classeId,

          anneeAcademique:
            dto.anneeAcademique,

          statut:
            (dto.statut as any) ??
            'ACTIVE',
        },

        include: {
          etudiant: true,

          classe: {
            include: {
              niveau: {
                include: {
                  formation: {
                    include: {
                      filiere: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
  }

  async findAllInscriptions() {
    return this.prisma
      .inscriptionEtudiant
      .findMany({
        include: {
          etudiant: true,

          classe: {
            include: {
              niveau: {
                include: {
                  formation: {
                    include: {
                      filiere: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          anneeAcademique: 'desc',
        },
      });
  }

  async findInscription(
    id: number,
  ) {
    const inscription =
      await this.prisma
        .inscriptionEtudiant
        .findUnique({
          where: { id },

          include: {
            etudiant: true,

            classe: {
              include: {
                niveau: {
                  include: {
                    formation: {
                      include: {
                        filiere: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

    if (!inscription) {
      throw new NotFoundException(
        `Inscription ${id} introuvable`,
      );
    }

    return inscription;
  }

  async inscriptionsEtudiant(
    etudiantId: number,
  ) {
    await this.findEtudiant(
      etudiantId,
    );

    return this.prisma
      .inscriptionEtudiant
      .findMany({
        where: {
          etudiantId,
        },

        include: {
          classe: {
            include: {
              niveau: {
                include: {
                  formation: true,
                },
              },
            },
          },
        },

        orderBy: {
          anneeAcademique: 'desc',
        },
      });
  }

  async inscriptionsClasse(
    classeId: number,
  ) {
    return this.prisma
      .inscriptionEtudiant
      .findMany({
        where: {
          classeId,
        },

        include: {
          etudiant: true,
        },

        orderBy: {
          etudiant: {
            nom: 'asc',
          },
        },
      });
  }

  async inscriptionsAnnee(
    annee: string,
  ) {
    return this.prisma
      .inscriptionEtudiant
      .findMany({
        where: {
          anneeAcademique:
            annee,
        },

        include: {
          etudiant: true,

          classe: {
            include: {
              niveau: {
                include: {
                  formation: true,
                },
              },
            },
          },
        },
      });
  }

  async updateInscription(
    id: number,
    dto: UpdateInscriptionDto,
  ) {
    const actuelle =
      await this.findInscription(id);

    const classeId =
      dto.classeId ??
      actuelle.classeId;

    const annee =
      dto.anneeAcademique ??
      actuelle.anneeAcademique;

    this.verifierAnnee(annee);

    const classe =
      await this.prisma.classe.findUnique({
        where: {
          id: classeId,
        },
      });

    if (!classe) {
      throw new NotFoundException(
        `Classe ${classeId} introuvable`,
      );
    }

    if (
      classe.annee !== annee
    ) {
      throw new ConflictException(
        `La classe appartient à l'année ${classe.annee}`,
      );
    }

    const duplicate =
      await this.prisma
        .inscriptionEtudiant
        .findFirst({
          where: {
            etudiantId:
              actuelle.etudiantId,

            anneeAcademique:
              annee,

            NOT: {
              id,
            },
          },
        });

    if (duplicate) {
      throw new ConflictException(
        'Une autre inscription existe déjà pour cette année',
      );
    }

    return this.prisma
      .inscriptionEtudiant
      .update({
        where: {
          id,
        },

        data: {
          classeId,
          anneeAcademique:
            annee,

          statut:
            dto.statut
              ? (dto.statut as any)
              : actuelle.statut,
        },

        include: {
          etudiant: true,
          classe: true,
        },
      });
  }

  async removeInscription(
    id: number,
  ) {
    await this.findInscription(id);

    return this.prisma
      .inscriptionEtudiant
      .delete({
        where: {
          id,
        },
      });
  }
}
