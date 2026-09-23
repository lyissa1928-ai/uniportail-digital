import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import * as bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import {
  randomBytes,
  randomUUID,
} from 'node:crypto';

import {
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';

import {
  basename,
  join,
} from 'node:path';

import {
  PrismaService,
} from '../prisma/prisma.service.js';

import {
  CreateDemandeAncienEtudiantDto,
} from './dto/create-demande-ancien-etudiant.dto.js';

import {
  SuiviDemandeAncienEtudiantDto,
} from './dto/suivi-demande-ancien-etudiant.dto.js';

@Injectable()
export class AnciensEtudiantsService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly config:
      ConfigService,
  ) {}

  private propre(
    value?: string,
  ) {
    const result =
      String(
        value ?? '',
      ).trim();

    return result ||
      null;
  }

  private email(
    value: string,
  ) {
    return value
      .trim()
      .toLowerCase();
  }

  private matricule(
    value?: string,
  ) {
    return String(
      value ?? '',
    )
      .trim()
      .toUpperCase();
  }

  private date(
    value?: string,
  ) {
    if (!value) {
      return null;
    }

    return new Date(
      value +
        'T00:00:00.000Z',
    );
  }

  private oui(
    value:
      string,
  ) {
    return value ===
      'true';
  }

  private storageRoot() {
    return (
      this.config.get<string>(
        'ANCIENS_ETUDIANTS_UPLOAD_DIR',
      ) ??
      '/opt/suivi-evaluations/uploads/anciens-etudiants'
    );
  }

  private extension(
    mimeType: string,
  ) {
    const values:
      Record<string, string> = {
        'application/pdf':
          '.pdf',
        'image/jpeg':
          '.jpg',
        'image/png':
          '.png',
      };

    return (
      values[mimeType] ??
      ''
    );
  }

  private verifierFichier(
    file: any,
    maxSize:
      number,
  ) {
    if (
      !file ||
      !Buffer.isBuffer(
        file.buffer,
      )
    ) {
      throw new BadRequestException(
        'Fichier justificatif invalide',
      );
    }

    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];

    if (
      !allowed.includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        'Format de fichier non autorisé. Utilisez PDF, JPG ou PNG.',
      );
    }

    if (
      file.size <= 0 ||
      file.size > maxSize
    ) {
      throw new BadRequestException(
        'La taille d’un justificatif dépasse la limite autorisée',
      );
    }
  }

  private async reference() {
    for (
      let attempt = 0;
      attempt < 6;
      attempt++
    ) {
      const reference =
        'AE-' +
        new Date()
          .getUTCFullYear() +
        '-' +
        randomBytes(5)
          .toString('hex')
          .toUpperCase();

      const exists =
        await this.prisma
          .demandeAncienEtudiant
          .findUnique({
            where: {
              reference,
            },

            select: {
              id: true,
            },
          });

      if (!exists) {
        return reference;
      }
    }

    throw new ConflictException(
      'Impossible de générer une référence unique',
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

    if (
      !host ||
      !from
    ) {
      return false;
    }

    const port =
      Number(
        this.config.get<string>(
          'SMTP_PORT',
        ) ??
        '587',
      );

    const secure =
      String(
        this.config.get<string>(
          'SMTP_SECURE',
        ) ??
        'false',
      )
        .toLowerCase() ===
      'true';

    const user =
      this.config.get<string>(
        'SMTP_USER',
      );

    const password =
      this.config.get<string>(
        'SMTP_PASSWORD',
      );

    try {
      const transporter =
        nodemailer
          .createTransport({
            host,
            port,
            secure,

            auth:
              user
                ? {
                    user,
                    pass:
                      password,
                  }
                : undefined,

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

      await transporter
        .sendMail({
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

  private motDePasseTemporaire() {
    return (
      'Tmp-' +
      randomBytes(12)
        .toString(
          'base64url',
        ) +
      '!'
    );
  }

  private async enregistrerFichiers(
    reference: string,
    identite: any,
    justificatifs:
      any[],
  ) {
    const directory =
      join(
        this.storageRoot(),
        reference,
      );

    await mkdir(
      directory,
      {
        recursive: true,
        mode: 0o750,
      },
    );

    const all = [
      {
        file:
          identite,
        type:
          'IDENTITE',
      },

      ...justificatifs
        .map(
          (file) => ({
            file,
            type:
              'JUSTIFICATIF_ACADEMIQUE',
          }),
        ),
    ];

    const records:
      Array<{
        type: string;
        nomOriginal: string;
        nomStockage: string;
        cheminStockage: string;
        mimeType: string;
        tailleOctets: number;
      }> = [];

    for (
      const item of all
    ) {
      const extension =
        this.extension(
          item.file
            .mimetype,
        );

      const nomStockage =
        randomUUID() +
        extension;

      const chemin =
        join(
          directory,
          nomStockage,
        );

      await writeFile(
        chemin,
        item.file.buffer,
        {
          mode: 0o640,
        },
      );

      records.push({
        type:
          item.type,
        nomOriginal:
          basename(
            String(
              item.file
                .originalname ??
              'document',
            ),
          )
            .replace(
              /["\r\n]/g,
              '_',
            )
            .slice(
              0,
              240,
            ),
        nomStockage,
        cheminStockage:
          chemin,
        mimeType:
          item.file
            .mimetype,
        tailleOctets:
          item.file
            .size,
      });
    }

    return {
      directory,
      records,
    };
  }

  async creerDemandePublique(
    dto:
      CreateDemandeAncienEtudiantDto,

    files: {
      identite?: any[];
      pieces?: any[];
    } = {},
  ) {
    const identites =
      files.identite ??
      [];

    const justificatifs =
      files.pieces ??
      [];

    if (
      identites.length !==
      1
    ) {
      throw new BadRequestException(
        'Une pièce d’identité est obligatoire',
      );
    }

    if (
      justificatifs.length <
      1
    ) {
      throw new BadRequestException(
        'Ajoutez au moins une preuve académique : carte étudiant, relevé, attestation, diplôme ou PV.',
      );
    }

    this.verifierFichier(
      identites[0],
      5 * 1024 * 1024,
    );

    for (
      const file of justificatifs
    ) {
      this.verifierFichier(
        file,
        8 * 1024 * 1024,
      );
    }

    if (
      dto.anneeSortie &&
      dto.anneeSortie <
        dto.anneeEntree
    ) {
      throw new BadRequestException(
        'L’année de sortie ne peut pas précéder l’année d’entrée',
      );
    }

    const diplomeObtenu =
      this.oui(
        dto.diplomeObtenu,
      );

    const dejaSoutenu =
      this.oui(
        dto.dejaSoutenu,
      );

    if (
      diplomeObtenu &&
      !dto.anneeObtention
    ) {
      throw new BadRequestException(
        'Indiquez l’année d’obtention du diplôme',
      );
    }

    const email =
      this.email(
        dto.email,
      );

    const matriculeDeclare =
      this.matricule(
        dto.matriculeDeclare,
      );

    const existing =
      await this.prisma
        .etudiant
        .findFirst({
          where: {
            OR: [
              ...(matriculeDeclare
                ? [
                    {
                      matricule:
                        matriculeDeclare,
                    },
                  ]
                : []),

              {
                email: {
                  equals:
                    email,
                  mode:
                    'insensitive',
                },
              },
            ],
          },

          select: {
            id: true,
            matricule:
              true,
          },
        });

    if (existing) {
      throw new ConflictException({
        code:
          'DOSSIER_EXISTANT',
        message:
          'Un dossier étudiant correspondant existe déjà. Utilisez votre compte étudiant ou contactez la scolarité pour le rattachement.',
        matricule:
          existing.matricule,
      });
    }

    const activeDuplicate =
      await this.prisma
        .demandeAncienEtudiant
        .findFirst({
          where: {
            email: {
              equals:
                email,
              mode:
                'insensitive',
            },

            nom: {
              equals:
                dto.nom.trim(),
              mode:
                'insensitive',
            },

            prenom: {
              equals:
                dto.prenom.trim(),
              mode:
                'insensitive',
            },

            dateNaissance:
              this.date(
                dto.dateNaissance,
              ) as Date,

            statut: {
              in: [
                'SOUMISE',
                'EN_VERIFICATION',
                'COMPLEMENT_REQUIS',
              ] as any,
            },
          },

          select: {
            reference:
              true,
          },
        });

    if (
      activeDuplicate
    ) {
      throw new ConflictException({
        code:
          'DEMANDE_EXISTANTE',
        message:
          'Une demande est déjà en cours de traitement.',
        reference:
          activeDuplicate
            .reference,
      });
    }

    const reference =
      await this.reference();

    const saved =
      await this
        .enregistrerFichiers(
          reference,
          identites[0],
          justificatifs,
        );

    let created:
      any;

    try {
      created =
        await this.prisma
          .demandeAncienEtudiant
          .create({
            data: {
              reference,
              email,

              telephone:
                dto.telephone
                  .trim(),

              nom:
                dto.nom
                  .trim()
                  .toUpperCase(),

              prenom:
                dto.prenom
                  .trim(),

              dateNaissance:
                this.date(
                  dto.dateNaissance,
                ) as Date,

              lieuNaissance:
                dto.lieuNaissance
                  .trim(),

              matriculeDeclare:
                matriculeDeclare ||
                null,

              etablissementLibelle:
                dto.etablissementLibelle
                  .trim(),

              departementLibelle:
                this.propre(
                  dto.departementLibelle,
                ),

              filiereLibelle:
                dto.filiereLibelle
                  .trim(),

              niveauGrade:
                dto.niveauGrade
                  .trim(),

              anneeEntree:
                dto.anneeEntree,

              anneeSortie:
                dto.anneeSortie ??
                null,

              derniereAnneeAcademique:
                dto.derniereAnneeAcademique
                  .trim(),

              diplomePrepare:
                dto.diplomePrepare
                  .trim(),

              diplomeObtenu,

              anneeObtention:
                dto.anneeObtention ??
                null,

              mention:
                this.propre(
                  dto.mention,
                ),

              dejaSoutenu,

              dateSoutenance:
                this.date(
                  dto.dateSoutenance,
                ),

              sujetSoutenance:
                this.propre(
                  dto.sujetSoutenance,
                ),

              directeurMemoire:
                this.propre(
                  dto.directeurMemoire,
                ),

              presidentJury:
                this.propre(
                  dto.presidentJury,
                ),

              numeroPv:
                this.propre(
                  dto.numeroPv,
                ),

              attestationReussite:
                this.oui(
                  dto.attestationReussite,
                ),

              objetDemande:
                dto.objetDemande as any,

              detailsDemande:
                this.propre(
                  dto.detailsDemande,
                ),

              pieces: {
                create:
                  saved.records
                    .map(
                      (
                        item,
                      ) => ({
                        ...item,
                        type:
                          item.type as any,
                      }),
                    ),
              },
            },

            select: {
              id: true,
              reference:
                true,
              statut:
                true,
              email:
                true,
              nom:
                true,
              prenom:
                true,
            },
          });
    }
    catch (error) {
      await rm(
        saved.directory,
        {
          recursive:
            true,
          force:
            true,
        },
      );

      throw error;
    }

    const emailEnvoye =
      await this.sendMail(
        email,
        'Réception de votre demande ancien étudiant',
        'Bonjour ' +
          created.prenom +
          ' ' +
          created.nom +
          ',\n\n' +
          'Votre demande de reconstitution / intégration de dossier a bien été reçue par UniPortail Digital.\n\n' +
          'Référence : ' +
          created.reference +
          '\n\n' +
          'Votre déclaration ne modifie pas encore le dossier académique officiel. La scolarité vérifiera les informations et les justificatifs transmis.\n\n' +
          'Conservez cette référence pour suivre votre demande.\n\n' +
          'UniPortail Digital',
      );

    if (
      emailEnvoye
    ) {
      await this.prisma
        .demandeAncienEtudiant
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

  async suivreDemande(
    dto:
      SuiviDemandeAncienEtudiantDto,
  ) {
    const item =
      await this.prisma
        .demandeAncienEtudiant
        .findFirst({
          where: {
            reference:
              dto.reference
                .trim()
                .toUpperCase(),

            email: {
              equals:
                this.email(
                  dto.email,
                ),

              mode:
                'insensitive',
            },
          },

          select: {
            reference:
              true,
            statut:
              true,
            objetDemande:
              true,
            motifTraitement:
              true,
            matriculeVerifie:
              true,
            dateVerification:
              true,
            dateDecision:
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

  async demandes(
    statut?: string,
  ) {
    const allowed = [
      'SOUMISE',
      'EN_VERIFICATION',
      'COMPLEMENT_REQUIS',
      'VALIDEE',
      'REJETEE',
    ];

    if (
      statut &&
      !allowed.includes(
        statut,
      )
    ) {
      throw new BadRequestException(
        'Statut de filtre invalide',
      );
    }

    return this.prisma
      .demandeAncienEtudiant
      .findMany({
        where:
          statut
            ? {
                statut:
                  statut as any,
              }
            : undefined,

        include: {
          _count: {
            select: {
              pieces:
                true,
            },
          },

          etudiant: {
            select: {
              id: true,
              matricule:
                true,
              nom: true,
              prenom:
                true,
              email:
                true,
            },
          },
        },

        orderBy: {
          createdAt:
            'desc',
        },
      });
  }

  async demande(
    id: number,
  ) {
    const item =
      await this.prisma
        .demandeAncienEtudiant
        .findUnique({
          where: {
            id,
          },

          include: {
            pieces: {
              orderBy: {
                createdAt:
                  'asc',
              },
            },

            etudiant: true,

            parcoursHistorique:
              true,
          },
        });

    if (!item) {
      throw new NotFoundException(
        'Demande ancien étudiant introuvable',
      );
    }

    return item;
  }

  private async getDemande(
    id: number,
  ) {
    const item =
      await this.prisma
        .demandeAncienEtudiant
        .findUnique({
          where: {
            id,
          },
        });

    if (!item) {
      throw new NotFoundException(
        'Demande ancien étudiant introuvable',
      );
    }

    return item;
  }

  async lirePiece(
    demandeId:
      number,
    pieceId:
      number,
  ) {
    const piece =
      await this.prisma
        .pieceJustificativeAncienEtudiant
        .findFirst({
          where: {
            id:
              pieceId,
            demandeId,
          },
        });

    if (!piece) {
      throw new NotFoundException(
        'Pièce justificative introuvable',
      );
    }

    let buffer:
      Buffer;

    try {
      buffer =
        await readFile(
          piece.cheminStockage,
        );
    }
    catch {
      throw new NotFoundException(
        'Le fichier justificatif n’est plus disponible sur le stockage',
      );
    }

    return {
      buffer,
      mimeType:
        piece.mimeType,
      nomTelechargement:
        basename(
          piece.nomOriginal,
        )
          .replace(
            /["\r\n]/g,
            '_',
          ),
    };
  }

  async mettreEnVerification(
    id:
      number,
    actor?: string,
  ) {
    const item =
      await this.getDemande(
        id,
      );

    if (
      ![
        'SOUMISE',
        'COMPLEMENT_REQUIS',
      ].includes(
        item.statut,
      )
    ) {
      throw new ConflictException(
        'Cette demande ne peut pas être mise en vérification depuis son statut actuel',
      );
    }

    return this.prisma
      .demandeAncienEtudiant
      .update({
        where: {
          id,
        },

        data: {
          statut:
            'EN_VERIFICATION',
          motifTraitement:
            null,
          traiteePar:
            actor ??
            null,
          dateVerification:
            new Date(),
        },
      });
  }

  async demanderComplement(
    id:
      number,
    motif:
      string,
    actor?: string,
  ) {
    const item =
      await this.getDemande(
        id,
      );

    if (
      ![
        'SOUMISE',
        'EN_VERIFICATION',
      ].includes(
        item.statut,
      )
    ) {
      throw new ConflictException(
        'Un complément ne peut plus être demandé pour ce dossier',
      );
    }

    const updated =
      await this.prisma
        .demandeAncienEtudiant
        .update({
          where: {
            id,
          },

          data: {
            statut:
              'COMPLEMENT_REQUIS',
            motifTraitement:
              motif.trim(),
            traiteePar:
              actor ??
              null,
          },
        });

    const emailEnvoye =
      await this.sendMail(
        updated.email,
        'Complément demandé pour votre dossier',
        'Bonjour ' +
          updated.prenom +
          ' ' +
          updated.nom +
          ',\n\n' +
          'La scolarité a besoin d’un complément pour la demande ' +
          updated.reference +
          '.\n\n' +
          'Motif : ' +
          motif.trim() +
          '\n\n' +
          'Veuillez contacter le service de scolarité en indiquant votre référence.\n\n' +
          'UniPortail Digital',
      );

    if (
      emailEnvoye
    ) {
      await this.prisma
        .demandeAncienEtudiant
        .update({
          where: {
            id,
          },

          data: {
            decisionEnvoyeeLe:
              new Date(),
          },
        });
    }

    return {
      ...updated,
      emailEnvoye,
    };
  }

  async rejeter(
    id:
      number,
    motif:
      string,
    actor?: string,
  ) {
    const item =
      await this.getDemande(
        id,
      );

    if (
      item.statut ===
        'VALIDEE' ||
      item.statut ===
        'REJETEE'
    ) {
      throw new ConflictException(
        'Cette demande est déjà clôturée',
      );
    }

    const updated =
      await this.prisma
        .demandeAncienEtudiant
        .update({
          where: {
            id,
          },

          data: {
            statut:
              'REJETEE',
            motifTraitement:
              motif.trim(),
            traiteePar:
              actor ??
              null,
            dateDecision:
              new Date(),
          },
        });

    const emailEnvoye =
      await this.sendMail(
        updated.email,
        'Décision concernant votre dossier ancien étudiant',
        'Bonjour ' +
          updated.prenom +
          ' ' +
          updated.nom +
          ',\n\n' +
          'La demande ' +
          updated.reference +
          ' n’a pas pu être validée.\n\n' +
          'Motif : ' +
          motif.trim() +
          '\n\n' +
          'Vous pouvez contacter le service de scolarité pour toute précision.\n\n' +
          'UniPortail Digital',
      );

    if (
      emailEnvoye
    ) {
      await this.prisma
        .demandeAncienEtudiant
        .update({
          where: {
            id,
          },

          data: {
            decisionEnvoyeeLe:
              new Date(),
          },
        });
    }

    return {
      ...updated,
      emailEnvoye,
    };
  }

  async valider(
    id:
      number,
    matriculeBrut:
      string,
    actor?: string,
  ) {
    const demande =
      await this.getDemande(
        id,
      );

    if (
      demande.statut !==
      'EN_VERIFICATION'
    ) {
      throw new ConflictException(
        'La demande doit d’abord être mise en vérification',
      );
    }

    const matricule =
      this.matricule(
        matriculeBrut,
      );

    const role =
      await this.prisma
        .role
        .findUnique({
          where: {
            code:
              'ETUDIANT',
          },
        });

    if (!role) {
      throw new NotFoundException(
        'Le rôle ETUDIANT est introuvable',
      );
    }

    const tempPassword =
      this.motDePasseTemporaire();

    const passwordHash =
      await bcrypt.hash(
        tempPassword,
        12,
      );

    const transaction =
      await this.prisma
        .$transaction(
          async (tx) => {
            let etudiant =
              await tx
                .etudiant
                .findUnique({
                  where: {
                    matricule,
                  },

                  include: {
                    utilisateur:
                      true,
                  },
                });

            let accountCreated =
              false;

            let accountEmail =
              '';

            if (!etudiant) {
              const emailEtudiant =
                await tx
                  .etudiant
                  .findUnique({
                    where: {
                      email:
                        demande.email,
                    },
                  });

              const emailUtilisateur =
                await tx
                  .utilisateur
                  .findUnique({
                    where: {
                      email:
                        demande.email,
                    },
                  });

              if (
                emailEtudiant ||
                emailUtilisateur
              ) {
                throw new ConflictException(
                  'L’adresse e-mail est déjà rattachée à un autre dossier. Vérifiez le rattachement avant validation.',
                );
              }

              etudiant =
                await tx
                  .etudiant
                  .create({
                    data: {
                      matricule,
                      nom:
                        demande.nom,
                      prenom:
                        demande.prenom,
                      dateNaissance:
                        demande.dateNaissance,
                      lieuNaissance:
                        demande.lieuNaissance,
                      email:
                        demande.email,
                      telephone:
                        demande.telephone,
                      origineDossier:
                        'RECONSTITUTION',
                      statutVerification:
                        'VERIFIE',
                      actif:
                        true,
                    },

                    include: {
                      utilisateur:
                        true,
                    },
                  });
            }
            else {
              const updateData:
                any = {
                  statutVerification:
                    'VERIFIE',
                };

              if (
                !etudiant
                  .lieuNaissance
              ) {
                updateData
                  .lieuNaissance =
                  demande
                    .lieuNaissance;
              }

              if (
                !etudiant.email
              ) {
                const conflict =
                  await tx
                    .utilisateur
                    .findUnique({
                      where: {
                        email:
                          demande.email,
                      },
                    });

                if (
                  conflict &&
                  conflict
                    .etudiantId !==
                    etudiant.id
                ) {
                  throw new ConflictException(
                    'L’adresse e-mail est déjà utilisée par un autre compte',
                  );
                }

                updateData.email =
                  demande.email;
              }

              etudiant =
                await tx
                  .etudiant
                  .update({
                    where: {
                      id:
                        etudiant.id,
                    },

                    data:
                      updateData,

                    include: {
                      utilisateur:
                        true,
                    },
                  });
            }

            let utilisateur =
              etudiant
                .utilisateur;

            accountEmail =
              (
                etudiant.email ??
                demande.email
              )
                .trim()
                .toLowerCase();

            if (!utilisateur) {
              const existingUser =
                await tx
                  .utilisateur
                  .findUnique({
                    where: {
                      email:
                        accountEmail,
                    },
                  });

              if (
                existingUser &&
                existingUser
                  .etudiantId !==
                  etudiant.id
              ) {
                throw new ConflictException(
                  'Un autre compte utilise déjà cette adresse e-mail',
                );
              }

              if (
                existingUser
              ) {
                utilisateur =
                  existingUser;
              }
              else {
                utilisateur =
                  await tx
                    .utilisateur
                    .create({
                      data: {
                        email:
                          accountEmail,
                        motDePasseHash:
                          passwordHash,
                        doitChangerMotDePasse:
                          true,
                        nomAffichage:
                          (
                            demande.prenom +
                            ' ' +
                            demande.nom
                          ).trim(),
                        actif:
                          true,
                        etudiantId:
                          etudiant.id,

                        roles: {
                          create: {
                            roleId:
                              role.id,
                          },
                        },
                      },
                    });

                accountCreated =
                  true;
              }
            }

            await tx
              .parcoursAcademiqueHistorique
              .upsert({
                where: {
                  sourceDemandeId:
                    demande.id,
                },

                update: {
                  etudiantId:
                    etudiant.id,
                  verifiePar:
                    actor ??
                    null,
                  dateVerification:
                    new Date(),
                },

                create: {
                  etablissementLibelle:
                    demande
                      .etablissementLibelle,
                  departementLibelle:
                    demande
                      .departementLibelle,
                  filiereLibelle:
                    demande
                      .filiereLibelle,
                  niveauGrade:
                    demande
                      .niveauGrade,
                  anneeEntree:
                    demande
                      .anneeEntree,
                  anneeSortie:
                    demande
                      .anneeSortie,
                  derniereAnneeAcademique:
                    demande
                      .derniereAnneeAcademique,
                  diplomePrepare:
                    demande
                      .diplomePrepare,
                  diplomeObtenu:
                    demande
                      .diplomeObtenu,
                  anneeObtention:
                    demande
                      .anneeObtention,
                  mention:
                    demande
                      .mention,
                  dejaSoutenu:
                    demande
                      .dejaSoutenu,
                  dateSoutenance:
                    demande
                      .dateSoutenance,
                  sujetSoutenance:
                    demande
                      .sujetSoutenance,
                  directeurMemoire:
                    demande
                      .directeurMemoire,
                  presidentJury:
                    demande
                      .presidentJury,
                  numeroPv:
                    demande
                      .numeroPv,
                  source:
                    'RECONSTITUTION',
                  verifiePar:
                    actor ??
                    null,
                  dateVerification:
                    new Date(),
                  etudiantId:
                    etudiant.id,
                  sourceDemandeId:
                    demande.id,
                },
              });

            const updated =
              await tx
                .demandeAncienEtudiant
                .update({
                  where: {
                    id:
                      demande.id,
                  },

                  data: {
                    statut:
                      'VALIDEE',
                    motifTraitement:
                      null,
                    traiteePar:
                      actor ??
                      null,
                    matriculeVerifie:
                      matricule,
                    dateDecision:
                      new Date(),
                    etudiantId:
                      etudiant.id,
                  },
                });

            return {
              updated,
              etudiant,
              accountCreated,
              accountEmail,
            };
          },
        );

    let emailEnvoye =
      false;

    if (
      transaction
        .accountCreated
    ) {
      emailEnvoye =
        await this.sendMail(
          transaction
            .accountEmail,
          'Activation de votre dossier étudiant',
          'Bonjour ' +
            demande.prenom +
            ' ' +
            demande.nom +
            ',\n\n' +
            'Votre ancien dossier académique a été validé et intégré dans UniPortail Digital.\n\n' +
            'Matricule / numéro de carte : ' +
            matricule +
            '\n' +
            'Identifiant : ' +
            transaction
              .accountEmail +
            '\n' +
            'Mot de passe temporaire : ' +
            tempPassword +
            '\n\n' +
            'Vous devrez modifier ce mot de passe à votre première connexion.\n\n' +
            'UniPortail Digital',
        );
    }
    else {
      emailEnvoye =
        await this.sendMail(
          demande.email,
          'Votre dossier ancien étudiant est validé',
          'Bonjour ' +
            demande.prenom +
            ' ' +
            demande.nom +
            ',\n\n' +
            'Votre demande ' +
            demande.reference +
            ' a été validée et rattachée à votre dossier étudiant.\n\n' +
            'Matricule : ' +
            matricule +
            '\n\n' +
            'UniPortail Digital',
        );
    }

    if (
      emailEnvoye
    ) {
      await this.prisma
        .demandeAncienEtudiant
        .update({
          where: {
            id,
          },

          data: {
            decisionEnvoyeeLe:
              new Date(),
          },
        });
    }

    return {
      demande:
        transaction.updated,
      etudiant:
        transaction.etudiant,
      compteCree:
        transaction
          .accountCreated,
      emailEnvoye,
    };
  }
}
