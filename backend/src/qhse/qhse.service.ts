import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class QhseService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private analyserAffectation(
    affectation: any,
  ) {
    const volumePrevuMinutes =
      affectation.cours.volumeHoraire * 60;

    const seancesValidees =
      affectation.seances.filter(
        (seance: any) =>
          seance.statut === 'VALIDEE',
      );

    const seancesDeclarees =
      affectation.seances.filter(
        (seance: any) =>
          seance.statut === 'DECLAREE',
      );

    const seancesRejetees =
      affectation.seances.filter(
        (seance: any) =>
          seance.statut === 'REJETEE',
      );

    const seancesAnnulees =
      affectation.seances.filter(
        (seance: any) =>
          seance.statut === 'ANNULEE',
      );

    const minutesValidees =
      seancesValidees.reduce(
        (
          total: number,
          seance: any,
        ) =>
          total +
          seance.dureeMinutes,
        0,
      );

    const minutesDeclarees =
      seancesDeclarees.reduce(
        (
          total: number,
          seance: any,
        ) =>
          total +
          seance.dureeMinutes,
        0,
      );

    const heuresValidees =
      Number(
        (
          minutesValidees / 60
        ).toFixed(2),
      );

    const heuresDeclarees =
      Number(
        (
          minutesDeclarees / 60
        ).toFixed(2),
      );

    const heuresRestantes =
      Number(
        (
          Math.max(
            0,
            volumePrevuMinutes -
              minutesValidees,
          ) / 60
        ).toFixed(2),
      );

    const tauxExecution =
      volumePrevuMinutes === 0
        ? 0
        : Number(
            (
              (
                minutesValidees /
                volumePrevuMinutes
              ) * 100
            ).toFixed(2),
          );

    const anomalies: string[] = [];

    if (
      minutesValidees === 0 &&
      seancesDeclarees.length === 0
    ) {
      anomalies.push(
        'COURS_NON_DEMARRE',
      );
    }

    if (
      minutesValidees <
        volumePrevuMinutes &&
      minutesValidees > 0
    ) {
      anomalies.push(
        'VOLUME_HORAIRE_INCOMPLET',
      );
    }

    if (
      minutesValidees >
      volumePrevuMinutes
    ) {
      anomalies.push(
        'DEPASSEMENT_VOLUME_HORAIRE',
      );
    }

    if (
      seancesRejetees.length > 0
    ) {
      anomalies.push(
        'SEANCES_REJETEES',
      );
    }

    if (
      seancesDeclarees.length > 0
    ) {
      anomalies.push(
        'SEANCES_EN_ATTENTE_VALIDATION',
      );
    }

    let etat = 'EN_COURS';

    if (
      minutesValidees === 0 &&
      seancesDeclarees.length === 0
    ) {
      etat = 'NON_DEMARRE';
    }

    if (
      minutesValidees >=
        volumePrevuMinutes &&
      minutesValidees <=
        volumePrevuMinutes
    ) {
      etat = 'TERMINE';
    }

    if (
      minutesValidees >
      volumePrevuMinutes
    ) {
      etat = 'DEPASSEMENT';
    }

    if (
      minutesValidees === 0 &&
      seancesDeclarees.length > 0
    ) {
      etat =
        'EN_ATTENTE_VALIDATION';
    }

    return {
      affectationId:
        affectation.id,

      anneeAcademique:
        affectation.anneeAcademique,

      enseignant: {
        id:
          affectation.enseignant.id,

        matricule:
          affectation.enseignant
            .matricule,

        nom:
          affectation.enseignant.nom,

        prenom:
          affectation.enseignant.prenom,
      },

      cours: {
        id:
          affectation.cours.id,

        code:
          affectation.cours.code,

        intitule:
          affectation.cours.intitule,

        volumeHoraire:
          affectation.cours
            .volumeHoraire,
      },

      classe: {
        id:
          affectation.classe.id,

        code:
          affectation.classe.code,

        nom:
          affectation.classe.nom,

        annee:
          affectation.classe.annee,
      },

      volumePrevuHeures:
        affectation.cours.volumeHoraire,

      heuresDeclarees,

      heuresValidees,

      heuresRestantes,

      tauxExecution,

      nombreSeances:
        affectation.seances.length,

      nombreValidees:
        seancesValidees.length,

      nombreEnAttente:
        seancesDeclarees.length,

      nombreRejetees:
        seancesRejetees.length,

      nombreAnnulees:
        seancesAnnulees.length,

      etat,

      anomalies,
    };
  }

  private async chargerAffectations(
    anneeAcademique?: string,
  ) {
    return this.prisma
      .affectationEnseignement
      .findMany({
        where: {
          actif: true,

          ...(anneeAcademique
            ? {
                anneeAcademique,
              }
            : {}),
        },

        include: {
          enseignant: true,

          cours: {
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

          classe: {
            include: {
              niveau: {
                include: {
                  formation: true,
                },
              },
            },
          },

          seances: true,
        },

        orderBy: {
          id: 'asc',
        },
      });
  }

  async tableauDeBord(
    anneeAcademique?: string,
  ) {
    const affectations =
      await this.chargerAffectations(
        anneeAcademique,
      );

    const analyses =
      affectations.map(
        (affectation) =>
          this.analyserAffectation(
            affectation,
          ),
      );

    const total =
      analyses.length;

    const nonDemarres =
      analyses.filter(
        (item) =>
          item.etat ===
          'NON_DEMARRE',
      ).length;

    const termines =
      analyses.filter(
        (item) =>
          item.etat ===
          'TERMINE',
      ).length;

    const enCours =
      analyses.filter(
        (item) =>
          item.etat ===
          'EN_COURS',
      ).length;

    const depassements =
      analyses.filter(
        (item) =>
          item.etat ===
          'DEPASSEMENT',
      ).length;

    const enAttente =
      analyses.filter(
        (item) =>
          item.nombreEnAttente > 0,
      ).length;

    const avecRejets =
      analyses.filter(
        (item) =>
          item.nombreRejetees > 0,
      ).length;

    const volumeTotalPrevu =
      analyses.reduce(
        (
          totalHeures,
          item,
        ) =>
          totalHeures +
          item.volumePrevuHeures,
        0,
      );

    const heuresValidees =
      analyses.reduce(
        (
          totalHeures,
          item,
        ) =>
          totalHeures +
          item.heuresValidees,
        0,
      );

    const tauxGlobal =
      volumeTotalPrevu === 0
        ? 0
        : Number(
            (
              (
                heuresValidees /
                volumeTotalPrevu
              ) * 100
            ).toFixed(2),
          );

    return {
      anneeAcademique:
        anneeAcademique ??
        'TOUTES',

      indicateurs: {
        nombreAffectations:
          total,

        coursNonDemarres:
          nonDemarres,

        coursEnCours:
          enCours,

        coursTermines:
          termines,

        depassementsHoraires:
          depassements,

        coursAvecSeancesEnAttente:
          enAttente,

        coursAvecSeancesRejetees:
          avecRejets,

        volumeTotalPrevuHeures:
          volumeTotalPrevu,

        heuresValidees:
          Number(
            heuresValidees.toFixed(2),
          ),

        tauxExecutionGlobal:
          tauxGlobal,
      },

      affectations:
        analyses,
    };
  }

  async alertes(
    anneeAcademique?: string,
  ) {
    const affectations =
      await this.chargerAffectations(
        anneeAcademique,
      );

    const analyses =
      affectations.map(
        (affectation) =>
          this.analyserAffectation(
            affectation,
          ),
      );

    const alertes: any[] = [];

    for (
      const analyse
      of analyses
    ) {
      for (
        const anomalie
        of analyse.anomalies
      ) {
        let niveau = 'INFO';

        if (
          anomalie ===
          'DEPASSEMENT_VOLUME_HORAIRE'
        ) {
          niveau = 'CRITIQUE';
        }

        if (
          anomalie ===
            'SEANCES_REJETEES' ||
          anomalie ===
            'COURS_NON_DEMARRE'
        ) {
          niveau = 'ATTENTION';
        }

        alertes.push({
          type:
            anomalie,

          niveau,

          affectationId:
            analyse.affectationId,

          anneeAcademique:
            analyse.anneeAcademique,

          cours:
            analyse.cours,

          classe:
            analyse.classe,

          enseignant:
            analyse.enseignant,

          tauxExecution:
            analyse.tauxExecution,

          heuresValidees:
            analyse.heuresValidees,

          volumePrevuHeures:
            analyse.volumePrevuHeures,
        });
      }
    }

    const ordreNiveau: Record<
      string,
      number
    > = {
      CRITIQUE: 1,
      ATTENTION: 2,
      INFO: 3,
    };

    alertes.sort(
      (a, b) =>
        ordreNiveau[a.niveau] -
        ordreNiveau[b.niveau],
    );

    return {
      nombreAlertes:
        alertes.length,

      alertesCritiques:
        alertes.filter(
          (a) =>
            a.niveau ===
            'CRITIQUE',
        ).length,

      alertesAttention:
        alertes.filter(
          (a) =>
            a.niveau ===
            'ATTENTION',
        ).length,

      alertesInformation:
        alertes.filter(
          (a) =>
            a.niveau === 'INFO',
        ).length,

      alertes,
    };
  }

  async suiviClasse(
    classeId: number,
  ) {
    const classe =
      await this.prisma.classe
        .findUnique({
          where: {
            id: classeId,
          },

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

            affectations: {
              where: {
                actif: true,
              },

              include: {
                enseignant: true,
                cours: true,
                seances: true,
              },
            },
          },
        });

    if (!classe) {
      throw new NotFoundException(
        `Classe ${classeId} introuvable`,
      );
    }

    const analyses =
      classe.affectations.map(
        (affectation) =>
          this.analyserAffectation({
            ...affectation,
            classe,
          }),
      );

    const volumePrevu =
      analyses.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.volumePrevuHeures,
        0,
      );

    const heuresValidees =
      analyses.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.heuresValidees,
        0,
      );

    const taux =
      volumePrevu === 0
        ? 0
        : Number(
            (
              (
                heuresValidees /
                volumePrevu
              ) * 100
            ).toFixed(2),
          );

    return {
      classe: {
        id:
          classe.id,

        code:
          classe.code,

        nom:
          classe.nom,

        annee:
          classe.annee,

        niveau:
          classe.niveau,
      },

      indicateurs: {
        nombreCours:
          analyses.length,

        volumePrevuHeures:
          volumePrevu,

        heuresValidees:
          Number(
            heuresValidees.toFixed(2),
          ),

        tauxExecution:
          taux,

        nonDemarres:
          analyses.filter(
            (a) =>
              a.etat ===
              'NON_DEMARRE',
          ).length,

        termines:
          analyses.filter(
            (a) =>
              a.etat ===
              'TERMINE',
          ).length,

        depassements:
          analyses.filter(
            (a) =>
              a.etat ===
              'DEPASSEMENT',
          ).length,
      },

      cours:
        analyses,
    };
  }

  async suiviFormation(
    formationId: number,
  ) {
    const formation =
      await this.prisma.formation
        .findUnique({
          where: {
            id: formationId,
          },

          include: {
            filiere: true,

            niveaux: {
              include: {
                classes: {
                  include: {
                    affectations: {
                      where: {
                        actif: true,
                      },

                      include: {
                        enseignant: true,
                        cours: true,
                        seances: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

    if (!formation) {
      throw new NotFoundException(
        `Formation ${formationId} introuvable`,
      );
    }

    const analyses: any[] = [];

    for (
      const niveau
      of formation.niveaux
    ) {
      for (
        const classe
        of niveau.classes
      ) {
        for (
          const affectation
          of classe.affectations
        ) {
          analyses.push(
            this.analyserAffectation({
              ...affectation,
              classe,
            }),
          );
        }
      }
    }

    const volumePrevu =
      analyses.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.volumePrevuHeures,
        0,
      );

    const heuresValidees =
      analyses.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.heuresValidees,
        0,
      );

    const taux =
      volumePrevu === 0
        ? 0
        : Number(
            (
              (
                heuresValidees /
                volumePrevu
              ) * 100
            ).toFixed(2),
          );

    return {
      formation: {
        id:
          formation.id,

        code:
          formation.code,

        nom:
          formation.nom,

        filiere:
          formation.filiere,
      },

      indicateurs: {
        nombreNiveaux:
          formation.niveaux.length,

        nombreClasses:
          formation.niveaux.reduce(
            (
              total,
              niveau,
            ) =>
              total +
              niveau.classes.length,
            0,
          ),

        nombreAffectations:
          analyses.length,

        volumePrevuHeures:
          volumePrevu,

        heuresValidees:
          Number(
            heuresValidees.toFixed(2),
          ),

        tauxExecution:
          taux,

        coursNonDemarres:
          analyses.filter(
            (a) =>
              a.etat ===
              'NON_DEMARRE',
          ).length,

        coursTermines:
          analyses.filter(
            (a) =>
              a.etat ===
              'TERMINE',
          ).length,

        depassements:
          analyses.filter(
            (a) =>
              a.etat ===
              'DEPASSEMENT',
          ).length,

        coursAvecRejets:
          analyses.filter(
            (a) =>
              a.nombreRejetees > 0,
          ).length,
      },

      details:
        analyses,
    };
  }
}
