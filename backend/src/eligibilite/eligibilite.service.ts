import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateValidationAcademiqueDto } from './dto/create-validation-academique.dto.js';
import { UpdateValidationAcademiqueDto } from './dto/update-validation-academique.dto.js';

@Injectable()
export class EligibiliteService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private analyser(inscription: any) {
    const motifs: string[] = [];

    const niveau =
      inscription.classe.niveau;

    const validation =
      inscription.validationAcademique;

    if (!niveau.terminal) {
      motifs.push(
        'NIVEAU_NON_TERMINAL',
      );
    }

    if (
      inscription.statut !==
      'TERMINEE'
    ) {
      motifs.push(
        'INSCRIPTION_NON_TERMINEE',
      );
    }

    if (!validation) {
      motifs.push(
        'VALIDATION_ACADEMIQUE_ABSENTE',
      );
    }

    if (validation) {
      if (
        validation.decision !==
        'ADMIS'
      ) {
        motifs.push(
          'DECISION_ACADEMIQUE_NON_ADMISE',
        );
      }

      if (
        validation.creditsObtenus <
        validation.creditsRequis
      ) {
        motifs.push(
          'CREDITS_INSUFFISANTS',
        );
      }

      if (
        validation.stageRequis &&
        !validation.stageValide
      ) {
        motifs.push(
          'STAGE_NON_VALIDE',
        );
      }

      if (
        validation.memoireRequis &&
        !validation.memoireValide
      ) {
        motifs.push(
          'MEMOIRE_NON_VALIDE',
        );
      }

      if (
        validation.decision ===
          'ADMIS' &&
        !validation.dateDeliberation
      ) {
        motifs.push(
          'DATE_DELIBERATION_ABSENTE',
        );
      }
    }

    const eligible =
      motifs.length === 0;

    return {
      eligible,

      statut:
        eligible
          ? 'ELIGIBLE'
          : 'NON_ELIGIBLE',

      motifs,

      etudiant: {
        id:
          inscription.etudiant.id,

        matricule:
          inscription.etudiant.matricule,

        nom:
          inscription.etudiant.nom,

        prenom:
          inscription.etudiant.prenom,
      },

      inscription: {
        id:
          inscription.id,

        anneeAcademique:
          inscription.anneeAcademique,

        statut:
          inscription.statut,
      },

      formation: {
        id:
          niveau.formation.id,

        code:
          niveau.formation.code,

        nom:
          niveau.formation.nom,
      },

      niveau: {
        id:
          niveau.id,

        code:
          niveau.code,

        nom:
          niveau.nom,

        terminal:
          niveau.terminal,
      },

      classe: {
        id:
          inscription.classe.id,

        code:
          inscription.classe.code,

        nom:
          inscription.classe.nom,
      },

      validationAcademique:
        validation
          ? {
              id:
                validation.id,

              decision:
                validation.decision,

              creditsObtenus:
                validation.creditsObtenus,

              creditsRequis:
                validation.creditsRequis,

              stageRequis:
                validation.stageRequis,

              stageValide:
                validation.stageValide,

              memoireRequis:
                validation.memoireRequis,

              memoireValide:
                validation.memoireValide,

              dateDeliberation:
                validation.dateDeliberation,
            }
          : null,
    };
  }

  private async chargerInscription(
    id: number,
  ) {
    const inscription =
      await this.prisma
        .inscriptionEtudiant
        .findUnique({
          where: {
            id,
          },

          include: {
            etudiant: true,

            validationAcademique:
              true,

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

  async creerValidation(
    dto: CreateValidationAcademiqueDto,
  ) {
    const inscription =
      await this.chargerInscription(
        dto.inscriptionId,
      );

    if (
      !inscription.classe.niveau
        .terminal
    ) {
      throw new ConflictException(
        "Une validation de diplôme ne peut être enregistrée que pour un niveau terminal",
      );
    }

    const existing =
      await this.prisma
        .validationAcademique
        .findUnique({
          where: {
            inscriptionId:
              dto.inscriptionId,
          },
        });

    if (existing) {
      throw new ConflictException(
        'Une validation académique existe déjà pour cette inscription',
      );
    }

    return this.prisma
      .validationAcademique
      .create({
        data: {
          inscriptionId:
            dto.inscriptionId,

          decision:
            dto.decision as any,

          creditsObtenus:
            dto.creditsObtenus,

          creditsRequis:
            dto.creditsRequis,

          stageRequis:
            dto.stageRequis ??
            false,

          stageValide:
            dto.stageValide ??
            false,

          memoireRequis:
            dto.memoireRequis ??
            false,

          memoireValide:
            dto.memoireValide ??
            false,

          dateDeliberation:
            dto.dateDeliberation
              ? new Date(
                  dto.dateDeliberation,
                )
              : null,

          observations:
            dto.observations
              ?.trim(),
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

  async updateValidation(
    id: number,
    dto: UpdateValidationAcademiqueDto,
  ) {
    const validation =
      await this.prisma
        .validationAcademique
        .findUnique({
          where: {
            id,
          },
        });

    if (!validation) {
      throw new NotFoundException(
        `Validation académique ${id} introuvable`,
      );
    }

    return this.prisma
      .validationAcademique
      .update({
        where: {
          id,
        },

        data: {
          decision:
            dto.decision
              ? (dto.decision as any)
              : undefined,

          creditsObtenus:
            dto.creditsObtenus,

          creditsRequis:
            dto.creditsRequis,

          stageRequis:
            dto.stageRequis,

          stageValide:
            dto.stageValide,

          memoireRequis:
            dto.memoireRequis,

          memoireValide:
            dto.memoireValide,

          dateDeliberation:
            dto.dateDeliberation
              ? new Date(
                  dto.dateDeliberation,
                )
              : undefined,

          observations:
            dto.observations
              ?.trim(),
        },
      });
  }

  async evaluerInscription(
    id: number,
  ) {
    const inscription =
      await this.chargerInscription(id);

    return this.analyser(
      inscription,
    );
  }

  async evaluerEtudiant(
    etudiantId: number,
  ) {
    const etudiant =
      await this.prisma
        .etudiant
        .findUnique({
          where: {
            id: etudiantId,
          },

          include: {
            inscriptions: {
              include: {
                validationAcademique:
                  true,

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

              orderBy: {
                anneeAcademique:
                  'desc',
              },
            },
          },
        });

    if (!etudiant) {
      throw new NotFoundException(
        `Etudiant ${etudiantId} introuvable`,
      );
    }

    const inscriptionsTerminales =
      etudiant.inscriptions.filter(
        (inscription) =>
          inscription.classe
            .niveau.terminal,
      );

    return {
      etudiant: {
        id:
          etudiant.id,

        matricule:
          etudiant.matricule,

        nom:
          etudiant.nom,

        prenom:
          etudiant.prenom,
      },

      evaluations:
        inscriptionsTerminales.map(
          (inscription) =>
            this.analyser(
              inscription,
            ),
        ),
    };
  }

  async evaluerMatricule(
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

    return this.evaluerEtudiant(
      etudiant.id,
    );
  }

  async listeEligibles() {
    const inscriptions =
      await this.prisma
        .inscriptionEtudiant
        .findMany({
          where: {
            statut: 'TERMINEE',

            classe: {
              niveau: {
                terminal: true,
              },
            },
          },

          include: {
            etudiant: true,

            validationAcademique:
              true,

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

    return inscriptions
      .map(
        (inscription) =>
          this.analyser(
            inscription,
          ),
      )
      .filter(
        (resultat) =>
          resultat.eligible,
      );
  }

  async listeNonEligibles() {
    const inscriptions =
      await this.prisma
        .inscriptionEtudiant
        .findMany({
          where: {
            classe: {
              niveau: {
                terminal: true,
              },
            },
          },

          include: {
            etudiant: true,

            validationAcademique:
              true,

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

    return inscriptions
      .map(
        (inscription) =>
          this.analyser(
            inscription,
          ),
      )
      .filter(
        (resultat) =>
          !resultat.eligible,
      );
  }
}
