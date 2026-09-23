import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { EligibiliteService } from '../eligibilite/eligibilite.service.js';
import { CreateDemandeDiplomeDto } from './dto/create-demande-diplome.dto.js';
import { PublicDiplomeLookupDto } from './dto/public-diplome-lookup.dto.js';
import { PublicDiplomeRequestDto } from './dto/public-diplome-request.dto.js';

@Injectable()
export class DiplomesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eligibiliteService: EligibiliteService,
  ) {}

  private async getDemande(id: number) {
    const demande =
      await this.prisma.demandeDiplome.findUnique({
        where: {
          id,
        },

        include: {
          diplome: true,

          inscription: {
            include: {
              etudiant: true,
              validationAcademique: true,

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
          },
        },
      });

    if (!demande) {
      throw new NotFoundException(
        `Demande de diplôme ${id} introuvable`,
      );
    }

    return demande;
  }

  private determinerTypeDiplome(
    codeNiveau: string,
    nomNiveau: string,
  ) {
    const valeur =
      `${codeNiveau} ${nomNiveau}`
        .toUpperCase();

    if (
      valeur.includes('BTS')
    ) {
      return 'BTS';
    }

    if (
      valeur.includes('BT') &&
      !valeur.includes('BTS')
    ) {
      return 'BT';
    }

    if (
      valeur.includes('L3') ||
      valeur.includes('LICENCE')
    ) {
      return 'LICENCE';
    }

    if (
      valeur.includes('M2') ||
      valeur.includes('MASTER')
    ) {
      return 'MASTER';
    }

    if (
      valeur.includes('DOCTOR')
    ) {
      return 'DOCTORAT';
    }

    return 'DIPLOME';
  }

  private genererNumero(
    demandeId: number,
  ) {
    const annee =
      new Date().getUTCFullYear();

    return `DIP-${annee}-${String(
      demandeId,
    ).padStart(6, '0')}`;
  }

  async creerDemande(
    dto: CreateDemandeDiplomeDto,
  ) {
    const resultat =
      await this.eligibiliteService
        .evaluerInscription(
          dto.inscriptionId,
        );

    if (!resultat.eligible) {
      throw new ConflictException({
        message:
          "L'étudiant n'est pas éligible au diplôme",

        motifs:
          resultat.motifs,
      });
    }

    const existante =
      await this.prisma
        .demandeDiplome
        .findUnique({
          where: {
            inscriptionId:
              dto.inscriptionId,
          },
        });

    if (existante) {
      throw new ConflictException(
        'Une demande existe déjà pour cette inscription',
      );
    }

    return this.prisma
      .demandeDiplome
      .create({
        data: {
          inscriptionId:
            dto.inscriptionId,

          statut:
            'DEMANDEE',
        },

        include: {
          inscription: {
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
          },
        },
      });
  }


  async creerDemandeEtudiant(
    inscriptionId: number,
    etudiantId: number,
  ) {
    const inscription =
      await this.prisma
        .inscriptionEtudiant
        .findUnique({
          where: {
            id: inscriptionId,
          },
        });

    if (!inscription) {
      throw new NotFoundException(
        `Inscription ${inscriptionId} introuvable`,
      );
    }

    if (
      inscription.etudiantId !==
      etudiantId
    ) {
      throw new ConflictException(
        "Cette inscription n'appartient pas à l'étudiant connecté",
      );
    }

    return this.creerDemande({
      inscriptionId,
    });
  }
  async findAll() {
    return this.prisma
      .demandeDiplome
      .findMany({
        include: {
          diplome: true,

          inscription: {
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
          },
        },

        orderBy: {
          dateDemande:
            'desc',
        },
      });
  }

  async findOne(id: number) {
    return this.getDemande(id);
  }

  async findByEtudiant(
    etudiantId: number,
  ) {
    const etudiant =
      await this.prisma
        .etudiant
        .findUnique({
          where: {
            id: etudiantId,
          },
        });

    if (!etudiant) {
      throw new NotFoundException(
        `Etudiant ${etudiantId} introuvable`,
      );
    }

    return this.prisma
      .demandeDiplome
      .findMany({
        where: {
          inscription: {
            etudiantId,
          },
        },

        include: {
          diplome: true,

          inscription: {
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

        orderBy: {
          dateDemande:
            'desc',
        },
      });
  }

  async findByMatricule(
    matricule: string,
  ) {
    const etudiant =
      await this.prisma
        .etudiant
        .findUnique({
          where: {
            matricule:
              matricule
                .trim()
                .toUpperCase(),
          },
        });

    if (!etudiant) {
      throw new NotFoundException(
        `Etudiant ${matricule} introuvable`,
      );
    }

    return this.findByEtudiant(
      etudiant.id,
    );
  }

  private async publicStudent(
    dto:
      PublicDiplomeLookupDto,
  ) {
    const matricule =
      dto.matricule
        .trim()
        .toUpperCase();

    const email =
      dto.email
        .trim()
        .toLowerCase();

    const etudiant =
      await this.prisma
        .etudiant
        .findFirst({
          where: {
            matricule,

            email: {
              equals:
                email,

              mode:
                'insensitive',
            },
          },
        });

    if (!etudiant) {
      throw new NotFoundException(
        'Aucun dossier correspondant aux informations fournies',
      );
    }

    return etudiant;
  }

  async verifierPublic(
    dto:
      PublicDiplomeLookupDto,
  ) {
    const etudiant =
      await this.publicStudent(
        dto,
      );

    const inscriptions =
      await this.prisma
        .inscriptionEtudiant
        .findMany({
          where: {
            etudiantId:
              etudiant.id,

            classe: {
              niveau: {
                terminal:
                  true,
              },
            },
          },

          include: {
            demandeDiplome: {
              include: {
                diplome:
                  true,
              },
            },

            classe: {
              include: {
                niveau: {
                  include: {
                    formation:
                      true,
                  },
                },
              },
            },
          },

          orderBy: {
            dateInscription:
              'desc',
          },
        });

    const dossiers =
      await Promise.all(
        inscriptions.map(
          async (
            inscription,
          ) => {
            const demande =
              inscription
                .demandeDiplome;

            let eligible =
              false;

            if (!demande) {
              try {
                const evaluation =
                  await this
                    .eligibiliteService
                    .evaluerInscription(
                      inscription.id,
                    );

                eligible =
                  evaluation
                    .eligible;
              }
              catch {
                eligible =
                  false;
              }
            }

            const statut =
              demande?.statut ??
              (
                eligible
                  ? 'DEMANDE_POSSIBLE'
                  : 'NON_ELIGIBLE'
              );

            return {
              inscriptionId:
                inscription.id,

              anneeAcademique:
                inscription
                  .anneeAcademique,

              formation:
                inscription
                  .classe
                  .niveau
                  .formation
                  .nom,

              niveau:
                inscription
                  .classe
                  .niveau
                  .nom,

              statut,

              disponible:
                demande
                  ?.statut ===
                  'DISPONIBLE',

              retire:
                demande
                  ?.statut ===
                  'RETIREE',

              peutDemander:
                !demande &&
                eligible,

              numeroDiplome:
                demande
                  ?.diplome
                  ?.numero ??
                null,

              dateDisponibilite:
                demande
                  ?.diplome
                  ?.dateDisponibilite ??
                null,

              dateRetrait:
                demande
                  ?.diplome
                  ?.dateRetrait ??
                null,
            };
          },
        ),
      );

    return {
      matricule:
        etudiant.matricule,

      dossiers,
    };
  }

  async demanderPublic(
    dto:
      PublicDiplomeRequestDto,
  ) {
    const etudiant =
      await this.publicStudent(
        dto,
      );

    const inscription =
      await this.prisma
        .inscriptionEtudiant
        .findFirst({
          where: {
            id:
              dto.inscriptionId,

            etudiantId:
              etudiant.id,

            classe: {
              niveau: {
                terminal:
                  true,
              },
            },
          },
        });

    if (!inscription) {
      throw new NotFoundException(
        'Inscription terminale introuvable',
      );
    }

    await this
      .creerDemandeEtudiant(
        inscription.id,
        etudiant.id,
      );

    return this.verifierPublic({
      matricule:
        dto.matricule,
      email:
        dto.email,
    });
  }

  async mettreEnVerification(
    id: number,
  ) {
    const demande =
      await this.getDemande(id);

    if (
      demande.statut !==
        'DEMANDEE' &&
      demande.statut !==
        'A_CORRIGER'
    ) {
      throw new ConflictException(
        `Transition impossible depuis ${demande.statut}`,
      );
    }

    return this.prisma
      .demandeDiplome
      .update({
        where: {
          id,
        },

        data: {
          statut:
            'EN_VERIFICATION',

          dateVerification:
            new Date(),

          motif:
            null,
        },
      });
  }

  async demanderCorrection(
    id: number,
    motif: string,
  ) {
    const demande =
      await this.getDemande(id);

    if (
      demande.statut !==
      'EN_VERIFICATION'
    ) {
      throw new ConflictException(
        'Une correction ne peut être demandée que pendant la vérification',
      );
    }

    return this.prisma
      .demandeDiplome
      .update({
        where: {
          id,
        },

        data: {
          statut:
            'A_CORRIGER',

          motif:
            motif.trim(),
        },
      });
  }

  async valider(
    id: number,
  ) {
    const demande =
      await this.getDemande(id);

    if (
      demande.statut !==
      'EN_VERIFICATION'
    ) {
      throw new ConflictException(
        'La demande doit être en vérification avant validation',
      );
    }

    const eligibility =
      await this.eligibiliteService
        .evaluerInscription(
          demande.inscriptionId,
        );

    if (!eligibility.eligible) {
      throw new ConflictException({
        message:
          'Les conditions académiques ne sont plus satisfaites',

        motifs:
          eligibility.motifs,
      });
    }

    return this.prisma
      .demandeDiplome
      .update({
        where: {
          id,
        },

        data: {
          statut:
            'VALIDEE',

          dateValidation:
            new Date(),

          motif:
            null,
        },
      });
  }

  async rejeter(
    id: number,
    motif: string,
  ) {
    const demande =
      await this.getDemande(id);

    if (
      ![
        'DEMANDEE',
        'EN_VERIFICATION',
        'A_CORRIGER',
      ].includes(
        demande.statut,
      )
    ) {
      throw new ConflictException(
        `Impossible de rejeter une demande au statut ${demande.statut}`,
      );
    }

    return this.prisma
      .demandeDiplome
      .update({
        where: {
          id,
        },

        data: {
          statut:
            'REJETEE',

          motif:
            motif.trim(),

          dateRejet:
            new Date(),
        },
      });
  }

  async annuler(
    id: number,
  ) {
    const demande =
      await this.getDemande(id);

    if (
      demande.statut ===
      'RETIREE'
    ) {
      throw new ConflictException(
        'Un diplôme déjà retiré ne peut pas être annulé',
      );
    }

    if (
      demande.statut ===
      'ANNULEE'
    ) {
      return demande;
    }

    return this.prisma
      .demandeDiplome
      .update({
        where: {
          id,
        },

        data: {
          statut:
            'ANNULEE',

          dateAnnulation:
            new Date(),
        },
      });
  }

  async generer(
    id: number,
  ) {
    const demande =
      await this.getDemande(id);

    if (
      demande.statut !==
      'VALIDEE'
    ) {
      throw new ConflictException(
        'La demande doit être validée avant génération du diplôme',
      );
    }

    if (demande.diplome) {
      throw new ConflictException(
        'Le diplôme a déjà été généré',
      );
    }

    const inscription =
      demande.inscription;

    const niveau =
      inscription.classe.niveau;

    const formation =
      niveau.formation;

    const etudiant =
      inscription.etudiant;

    const typeDiplome =
      this.determinerTypeDiplome(
        niveau.code,
        niveau.nom,
      );

    const numero =
      this.genererNumero(
        demande.id,
      );

    const intitule =
      `${typeDiplome} - ${formation.nom}`;

    const operations = [
      this.prisma.diplome.create({
        data: {
          numero,

          typeDiplome,

          intitule,

          matriculeTitulaire:
            etudiant.matricule,

          nomTitulaire:
            etudiant.nom,

          prenomTitulaire:
            etudiant.prenom,

          formationLibelle:
            formation.nom,

          niveauLibelle:
            niveau.nom,

          anneeAcademique:
            inscription
              .anneeAcademique,

          demandeId:
            demande.id,
        },
      }),

      this.prisma
        .demandeDiplome
        .update({
          where: {
            id,
          },

          data: {
            statut:
              'GENEREE',
          },
        }),
    ];

    await this.prisma
      .$transaction(
        operations,
      );

    return this.getDemande(id);
  }

  async signer(
    id: number,
  ) {
    const demande =
      await this.getDemande(id);

    if (
      demande.statut !==
      'GENEREE'
    ) {
      throw new ConflictException(
        'Le diplôme doit être généré avant signature',
      );
    }

    if (!demande.diplome) {
      throw new ConflictException(
        'Diplôme introuvable',
      );
    }

    await this.prisma
      .$transaction([
        this.prisma.diplome.update({
          where: {
            id:
              demande.diplome.id,
          },

          data: {
            dateSignature:
              new Date(),
          },
        }),

        this.prisma
          .demandeDiplome
          .update({
            where: {
              id,
            },

            data: {
              statut:
                'SIGNEE',
            },
          }),
      ]);

    return this.getDemande(id);
  }

  async rendreDisponible(
    id: number,
  ) {
    const demande =
      await this.getDemande(id);

    if (
      demande.statut !==
      'SIGNEE'
    ) {
      throw new ConflictException(
        'Le diplôme doit être signé avant sa mise à disposition',
      );
    }

    if (!demande.diplome) {
      throw new ConflictException(
        'Diplôme introuvable',
      );
    }

    await this.prisma
      .$transaction([
        this.prisma.diplome.update({
          where: {
            id:
              demande.diplome.id,
          },

          data: {
            dateDisponibilite:
              new Date(),
          },
        }),

        this.prisma
          .demandeDiplome
          .update({
            where: {
              id,
            },

            data: {
              statut:
                'DISPONIBLE',
            },
          }),
      ]);

    return this.getDemande(id);
  }

  async retirer(
    id: number,
    retirePar: string,
  ) {
    const demande =
      await this.getDemande(id);

    if (
      demande.statut !==
      'DISPONIBLE'
    ) {
      throw new ConflictException(
        'Le diplôme doit être disponible avant retrait',
      );
    }

    if (!demande.diplome) {
      throw new ConflictException(
        'Diplôme introuvable',
      );
    }

    await this.prisma
      .$transaction([
        this.prisma.diplome.update({
          where: {
            id:
              demande.diplome.id,
          },

          data: {
            dateRetrait:
              new Date(),

            retirePar:
              retirePar.trim(),
          },
        }),

        this.prisma
          .demandeDiplome
          .update({
            where: {
              id,
            },

            data: {
              statut:
                'RETIREE',
            },
          }),
      ]);

    return this.getDemande(id);
  }

  async diplomesDisponibles() {
    return this.prisma
      .demandeDiplome
      .findMany({
        where: {
          statut:
            'DISPONIBLE',
        },

        include: {
          diplome: true,

          inscription: {
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
          },
        },

        orderBy: {
          updatedAt:
            'desc',
        },
      });
  }

  async diplomesRetires() {
    return this.prisma
      .demandeDiplome
      .findMany({
        where: {
          statut:
            'RETIREE',
        },

        include: {
          diplome: true,

          inscription: {
            include: {
              etudiant: true,
            },
          },
        },

        orderBy: {
          updatedAt:
            'desc',
        },
      });
  }
}
