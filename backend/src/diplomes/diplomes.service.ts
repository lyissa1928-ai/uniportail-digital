import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  readFileSync,
} from 'node:fs';

import nodemailer from 'nodemailer';

import { PrismaService } from '../prisma/prisma.service.js';
import { EligibiliteService } from '../eligibilite/eligibilite.service.js';
import { CreateDemandeDiplomeDto } from './dto/create-demande-diplome.dto.js';
import { PublicDiplomeLookupDto } from './dto/public-diplome-lookup.dto.js';
import { PublicDiplomeRequestDto } from './dto/public-diplome-request.dto.js';
import { PublicExternalDiplomaRequestDto } from './dto/public-external-diploma-request.dto.js';
import { PublicExternalDiplomaTrackDto } from './dto/public-external-diploma-track.dto.js';

@Injectable()
export class DiplomesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eligibiliteService: EligibiliteService,
    private readonly config: ConfigService,
  ) {}

  private smtpPassword() {
    const passwordFile =
      this.config.get<string>(
        'SMTP_PASSWORD_FILE',
      );

    if (
      passwordFile
    ) {
      try {
        return readFileSync(
          passwordFile,
          'utf8',
        ).trimEnd();
      }
      catch {
        return '';
      }
    }

    return (
      this.config.get<string>(
        'SMTP_PASSWORD',
      ) ??
      ''
    );
  }

  private async sendMail(
    to: string,
    subject: string,
    text: string,
  ) {
    const host =
      this.config.get<string>(
        'SMTP_HOST',
      );

    const from =
      this.config.get<string>(
        'SMTP_FROM',
      );

    const user =
      this.config.get<string>(
        'SMTP_USER',
      );

    const password =
      this.smtpPassword();

    const port =
      Number(
        this.config.get<string>(
          'SMTP_PORT',
        ) ??
        '465',
      );

    const secure =
      (
        this.config.get<string>(
          'SMTP_SECURE',
        ) ??
        'true'
      ).toLowerCase() ===
      'true';

    if (
      !host ||
      !from ||
      !user ||
      !password
    ) {
      return false;
    }

    try {
      const transporter =
        nodemailer.createTransport({
          host,
          port,
          secure,

          auth: {
            user,
            pass:
              password,
          },

          connectionTimeout:
            10000,

          greetingTimeout:
            10000,

          socketTimeout:
            20000,

          tls: {
            minVersion:
              'TLSv1.2',

            servername:
              host,
          },
        });

      await transporter.sendMail({
        from,
        to,
        subject,
        text,
      });

      return true;
    }
    catch {
      return false;
    }
  }

  private externalReference(
    id: number,
  ) {
    const year =
      new Date()
        .getUTCFullYear();

    return (
      'EXT-' +
      year +
      '-' +
      String(
        id,
      ).padStart(
        6,
        '0',
      )
    );
  }

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

  async creerDemandeExterne(
    dto:
      PublicExternalDiplomaRequestDto,
  ) {
    const email =
      dto.email
        .trim()
        .toLowerCase();

    const matricule =
      dto.matricule
        ?.trim()
        .toUpperCase() ||
      null;

    const dateNaissance =
      new Date(
        dto.dateNaissance,
      );

    if (
      Number.isNaN(
        dateNaissance.getTime(),
      )
    ) {
      throw new ConflictException(
        'Date de naissance invalide',
      );
    }

    const existante =
      await this.prisma
        .demandeDiplomeExterne
        .findFirst({
          where: {
            email: {
              equals:
                email,

              mode:
                'insensitive',
            },

            matricule:
              matricule,

            anneeObtention:
              dto.anneeObtention,

            typeDemande:
              dto.typeDemande,

            statut: {
              in: [
                'DEMANDEE',
                'EN_VERIFICATION',
                'DISPONIBLE',
              ],
            },
          },

          orderBy: {
            createdAt:
              'desc',
          },
        });

    if (existante) {
      throw new ConflictException(
        'Une demande identique est déjà enregistrée sous la référence ' +
        existante.reference,
      );
    }

    const created =
      await this.prisma
        .$transaction(
          async (
            tx,
          ) => {
            const draft =
              await tx
                .demandeDiplomeExterne
                .create({
                  data: {
                    reference:
                      'TEMP-' +
                      Date.now() +
                      '-' +
                      Math.random()
                        .toString(36)
                        .slice(
                          2,
                          8,
                        ),

                    email,
                    matricule,

                    nom:
                      dto.nom
                        .trim()
                        .toUpperCase(),

                    prenom:
                      dto.prenom
                        .trim(),

                    dateNaissance,

                    anneeObtention:
                      dto.anneeObtention,

                    intituleDiplome:
                      dto.intituleDiplome
                        .trim(),

                    typeDemande:
                      dto.typeDemande,
                  },
                });

            return tx
              .demandeDiplomeExterne
              .update({
                where: {
                  id:
                    draft.id,
                },

                data: {
                  reference:
                    this.externalReference(
                      draft.id,
                    ),
                },
              });
          },
        );

    const typeLabel =
      dto.typeDemande ===
      'DUPLICATA'
        ? 'duplicata de diplôme'
        : 'diplôme';

    const emailEnvoye =
      await this.sendMail(
        email,
        'Confirmation de votre demande de ' +
          typeLabel,
        'Bonjour ' +
          dto.prenom.trim() +
          ' ' +
          dto.nom.trim() +
          ',\n\n' +
          'Votre demande de ' +
          typeLabel +
          ' a bien été enregistrée sur UniPortail Digital.\n\n' +
          'Référence : ' +
          created.reference +
          '\n' +
          'Diplôme concerné : ' +
          created.intituleDiplome +
          '\n' +
          'Année d’obtention : ' +
          created.anneeObtention +
          '\n\n' +
          'Votre dossier sera vérifié par le service compétent. Vous recevrez un nouvel e-mail lorsque votre diplôme sera disponible.\n\n' +
          'UniPortail Digital',
      );

    if (
      emailEnvoye
    ) {
      await this.prisma
        .demandeDiplomeExterne
        .update({
          where: {
            id:
              created.id,
          },

          data: {
            confirmationEnvoyeeLe:
              new Date(),
          },
        });
    }

    return {
      reference:
        created.reference,

      statut:
        created.statut,

      emailEnvoye,
    };
  }

  async suivreDemandeExterne(
    dto:
      PublicExternalDiplomaTrackDto,
  ) {
    const item =
      await this.prisma
        .demandeDiplomeExterne
        .findFirst({
          where: {
            reference:
              dto.reference
                .trim()
                .toUpperCase(),

            email: {
              equals:
                dto.email
                  .trim()
                  .toLowerCase(),

              mode:
                'insensitive',
            },
          },

          select: {
            reference:
              true,
            typeDemande:
              true,
            statut:
              true,
            intituleDiplome:
              true,
            anneeObtention:
              true,
            dateDisponibilite:
              true,
            motif:
              true,
            createdAt:
              true,
          },
        });

    if (!item) {
      throw new NotFoundException(
        'Demande introuvable',
      );
    }

    return item;
  }

  async demandesExternes() {
    return this.prisma
      .demandeDiplomeExterne
      .findMany({
        orderBy: {
          createdAt:
            'desc',
        },
      });
  }

  private async getDemandeExterne(
    id:
      number,
  ) {
    const item =
      await this.prisma
        .demandeDiplomeExterne
        .findUnique({
          where: {
            id,
          },
        });

    if (!item) {
      throw new NotFoundException(
        'Demande externe introuvable',
      );
    }

    return item;
  }

  async verifierDemandeExterne(
    id:
      number,
    actor?: string,
  ) {
    const item =
      await this.getDemandeExterne(
        id,
      );

    if (
      item.statut !==
      'DEMANDEE'
    ) {
      throw new ConflictException(
        'Seule une demande déposée peut être mise en vérification',
      );
    }

    return this.prisma
      .demandeDiplomeExterne
      .update({
        where: {
          id,
        },

        data: {
          statut:
            'EN_VERIFICATION',

          traiteePar:
            actor ??
            null,

          motif:
            null,
        },
      });
  }

  async validerDemandeExterne(
    id:
      number,
    actor?: string,
  ) {
    const item =
      await this.getDemandeExterne(
        id,
      );

    if (
      ![
        'DEMANDEE',
        'EN_VERIFICATION',
      ].includes(
        item.statut,
      )
    ) {
      throw new ConflictException(
        'Cette demande ne peut plus être validée',
      );
    }

    const now =
      new Date();

    const updated =
      await this.prisma
        .demandeDiplomeExterne
        .update({
          where: {
            id,
          },

          data: {
            statut:
              'DISPONIBLE',

            dateValidation:
              now,

            dateDisponibilite:
              now,

            traiteePar:
              actor ??
              null,

            motif:
              null,
          },
        });

    const emailEnvoye =
      await this.sendMail(
        updated.email,
        'Votre diplôme est disponible',
        'Bonjour ' +
          updated.prenom +
          ' ' +
          updated.nom +
          ',\n\n' +
          'Votre demande ' +
          updated.reference +
          ' a été validée.\n\n' +
          'Votre diplôme « ' +
          updated.intituleDiplome +
          ' » est désormais disponible auprès du service compétent.\n\n' +
          'Merci de vous présenter avec une pièce d’identité et la référence de votre demande.\n\n' +
          'UniPortail Digital',
      );

    if (
      emailEnvoye
    ) {
      await this.prisma
        .demandeDiplomeExterne
        .update({
          where: {
            id,
          },

          data: {
            disponibiliteEnvoyeeLe:
              new Date(),
          },
        });
    }

    return {
      ...updated,
      emailEnvoye,
    };
  }

  async rejeterDemandeExterne(
    id:
      number,
    motif:
      string,
    actor?: string,
  ) {
    const item =
      await this.getDemandeExterne(
        id,
      );

    if (
      item.statut ===
      'DISPONIBLE'
    ) {
      throw new ConflictException(
        'Une demande déjà disponible ne peut pas être rejetée',
      );
    }

    return this.prisma
      .demandeDiplomeExterne
      .update({
        where: {
          id,
        },

        data: {
          statut:
            'REJETEE',

          motif:
            motif.trim(),

          traiteePar:
            actor ??
            null,
        },
      });
  }

  async renvoyerDisponibiliteExterne(
    id:
      number,
  ) {
    const item =
      await this.getDemandeExterne(
        id,
      );

    if (
      item.statut !==
      'DISPONIBLE'
    ) {
      throw new ConflictException(
        'Le diplôme doit être disponible avant le renvoi du message',
      );
    }

    const emailEnvoye =
      await this.sendMail(
        item.email,
        'Votre diplôme est disponible',
        'Bonjour ' +
          item.prenom +
          ' ' +
          item.nom +
          ',\n\n' +
          'Votre demande ' +
          item.reference +
          ' a été validée. Votre diplôme « ' +
          item.intituleDiplome +
          ' » est disponible.\n\n' +
          'UniPortail Digital',
      );

    if (
      emailEnvoye
    ) {
      await this.prisma
        .demandeDiplomeExterne
        .update({
          where: {
            id,
          },

          data: {
            disponibiliteEnvoyeeLe:
              new Date(),
          },
        });
    }

    return {
      emailEnvoye,
    };
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
