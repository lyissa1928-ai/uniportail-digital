import {
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReportingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async tableauDeBord(
    anneeAcademique?: string,
  ) {
    const whereAnnee =
      anneeAcademique
        ? {
            anneeAcademique,
          }
        : {};

    const [
      etudiantsActifs,
      enseignantsActifs,
      formationsActives,
      coursActifs,
      inscriptions,
      demandesDiplomes,
      audits30j,
    ] =
      await Promise.all([
        this.prisma.etudiant.count({
          where: {
            actif: true,
          },
        }),

        this.prisma.enseignant.count({
          where: {
            actif: true,
          },
        }),

        this.prisma.formation.count({
          where: {
            actif: true,
          },
        }),

        this.prisma.cours.count({
          where: {
            actif: true,
          },
        }),

        this.prisma.inscriptionEtudiant.count({
          where:
            anneeAcademique
              ? {
                  anneeAcademique,
                }
              : {},
        }),

        this.prisma.demandeDiplome.findMany({
          where:
            anneeAcademique
              ? {
                  inscription: {
                    anneeAcademique,
                  },
                }
              : {},

          select: {
            statut: true,
          },
        }),

        this.prisma.auditLog.findMany({
          where: {
            createdAt: {
              gte:
                new Date(
                  Date.now() -
                  30 *
                    24 *
                    60 *
                    60 *
                    1000,
                ),
            },
          },

          select: {
            succes: true,
          },
        }),
      ]);

    const affectations =
      await this.prisma
        .affectationEnseignement
        .findMany({
          where: {
            actif: true,
            ...whereAnnee,
          },

          include: {
            cours: true,
            seances: true,
          },
        });

    const classes =
      await this.prisma.classe.count({
        where:
          anneeAcademique
            ? {
                annee:
                  anneeAcademique,
                actif: true,
              }
            : {
                actif: true,
              },
      });

    let volumePrevuMinutes = 0;
    let minutesValidees = 0;

    let seancesDeclarees = 0;
    let seancesValidees = 0;
    let seancesRejetees = 0;
    let seancesAnnulees = 0;

    let coursNonDemarres = 0;
    let coursTermines = 0;
    let depassements = 0;

    for (
      const affectation
      of affectations
    ) {
      const volume =
        affectation.cours
          .volumeHoraire * 60;

      volumePrevuMinutes +=
        volume;

      const valide =
        affectation.seances
          .filter(
            (seance) =>
              seance.statut ===
              'VALIDEE',
          )
          .reduce(
            (total, seance) =>
              total +
              seance.dureeMinutes,
            0,
          );

      minutesValidees +=
        valide;

      if (
        affectation.seances.length ===
        0
      ) {
        coursNonDemarres++;
      }

      if (
        valide === volume &&
        volume > 0
      ) {
        coursTermines++;
      }

      if (
        valide > volume
      ) {
        depassements++;
      }

      for (
        const seance
        of affectation.seances
      ) {
        if (
          seance.statut ===
          'DECLAREE'
        ) {
          seancesDeclarees++;
        }

        if (
          seance.statut ===
          'VALIDEE'
        ) {
          seancesValidees++;
        }

        if (
          seance.statut ===
          'REJETEE'
        ) {
          seancesRejetees++;
        }

        if (
          seance.statut ===
          'ANNULEE'
        ) {
          seancesAnnulees++;
        }
      }
    }

    const inscriptionsTerminales =
      await this.prisma
        .inscriptionEtudiant
        .findMany({
          where: {
            ...(anneeAcademique
              ? {
                  anneeAcademique,
                }
              : {}),

            classe: {
              niveau: {
                terminal: true,
              },
            },
          },

          include: {
            validationAcademique:
              true,
          },
        });

    let eligibles = 0;
    let nonEligibles = 0;

    for (
      const inscription
      of inscriptionsTerminales
    ) {
      const validation =
        inscription
          .validationAcademique;

      const eligible =
        inscription.statut ===
          'TERMINEE' &&
        !!validation &&
        validation.decision ===
          'ADMIS' &&
        validation.creditsObtenus >=
          validation.creditsRequis &&
        (
          !validation.stageRequis ||
          validation.stageValide
        ) &&
        (
          !validation.memoireRequis ||
          validation.memoireValide
        ) &&
        !!validation.dateDeliberation;

      if (eligible) {
        eligibles++;
      }
      else {
        nonEligibles++;
      }
    }

    const statutsDiplomes:
      Record<string, number> = {};

    for (
      const demande
      of demandesDiplomes
    ) {
      statutsDiplomes[
        demande.statut
      ] =
        (
          statutsDiplomes[
            demande.statut
          ] ?? 0
        ) + 1;
    }

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

    return {
      anneeAcademique:
        anneeAcademique ??
        'TOUTES',

      referentiel: {
        formations:
          formationsActives,

        classes,

        cours:
          coursActifs,
      },

      population: {
        etudiantsActifs,
        enseignantsActifs,
        inscriptions,
      },

      enseignements: {
        affectations:
          affectations.length,

        volumePrevuHeures:
          Number(
            (
              volumePrevuMinutes /
              60
            ).toFixed(2),
          ),

        heuresValidees:
          Number(
            (
              minutesValidees /
              60
            ).toFixed(2),
          ),

        tauxExecution,

        coursNonDemarres,
        coursTermines,
        depassements,
      },

      seances: {
        enAttente:
          seancesDeclarees,

        validees:
          seancesValidees,

        rejetees:
          seancesRejetees,

        annulees:
          seancesAnnulees,
      },

      eligibilite: {
        dossiersTerminaux:
          inscriptionsTerminales
            .length,

        eligibles,

        nonEligibles,
      },

      diplomes: {
        totalDemandes:
          demandesDiplomes.length,

        parStatut:
          statutsDiplomes,
      },

      audit: {
        periode:
          '30 derniers jours',

        operations:
          audits30j.length,

        reussies:
          audits30j.filter(
            (audit) =>
              audit.succes,
          ).length,

        echouees:
          audits30j.filter(
            (audit) =>
              !audit.succes,
          ).length,
      },
    };
  }

  async synthese() {
    const [
      notificationsNonLues,
      demandesEnAttente,
      seancesEnAttente,
      demandesDisponibles,
    ] =
      await Promise.all([
        this.prisma.notification.count({
          where: {
            lu: false,
          },
        }),

        this.prisma.demandeDiplome.count({
          where: {
            statut: {
              in: [
                'DEMANDEE',
                'EN_VERIFICATION',
                'A_CORRIGER',
              ],
            },
          },
        }),

        this.prisma.seanceCours.count({
          where: {
            statut: 'DECLAREE',
          },
        }),

        this.prisma.demandeDiplome.count({
          where: {
            statut:
              'DISPONIBLE',
          },
        }),
      ]);

    return {
      actionsAEffectuer: {
        seancesAValider:
          seancesEnAttente,

        demandesDiplomeATraiter:
          demandesEnAttente,

        diplomesDisponibles:
          demandesDisponibles,

        notificationsNonLues:
          notificationsNonLues,
      },
    };
  }
}
