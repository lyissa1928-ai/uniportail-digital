import {
  beforeAll,
  afterAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  ValidationPipe,
} from '@nestjs/common';

import {
  Test,
} from '@nestjs/testing';

import request from 'supertest';

import dotenv from 'dotenv';

dotenv.config({
  path: '.env.test',
  override: true,
});

describe(
  'API Suivi Evaluation - E2E',
  () => {
    let app: any;

    let adminToken = '';
    let enseignantToken = '';
    let etudiantToken = '';

    const suffix =
      Math.random()
        .toString(36)
        .slice(2, 10)
        .toUpperCase();

    const annee =
      '2026-2027';

    const admin = {
      email:
        `admin.${suffix.toLowerCase()}@e2e.test`,

      motDePasse:
        'Admin-E2E-2026-Securise!',
    };

    let filiereId: number;
    let formationId: number;
    let niveauId: number;
    let classeId: number;
    let coursId: number;

    let enseignant1Id: number;
    let enseignant2Id: number;

    let affectation1Id: number;
    let affectation2Id: number;

    let etudiant1Id: number;
    let etudiant2Id: number;

    let inscription1Id: number;
    let inscription2Id: number;

    let demandeId: number;

    const auth = (
      token: string,
    ) => ({
      Authorization:
        `Bearer ${token}`,
    });

    beforeAll(
      async () => {
        const {
          AppModule,
        } =
          await import(
            '../../src/app.module.js'
          );

        const moduleRef =
          await Test
            .createTestingModule({
              imports: [
                AppModule,
              ],
            })
            .compile();

        app =
          moduleRef
            .createNestApplication();

        app.setGlobalPrefix(
          'api',
        );

        app.useGlobalPipes(
          new ValidationPipe({
            whitelist: true,

            forbidNonWhitelisted:
              true,

            transform: true,

            transformOptions: {
              enableImplicitConversion:
                true,
            },
          }),
        );

        await app.init();
      },
    );

    afterAll(
      async () => {
        if (app) {
          await app.close();
        }
      },
    );

    it(
      'expose le health check sans authentification',
      async () => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .get('/api/health');

        expect(
          response.status,
        ).toBe(200);

        expect(
          response.body.status,
        ).toBe('ok');
      },
    );

    it(
      'protege les routes privees sans JWT',
      async () => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .get(
              '/api/utilisateurs',
            );

        expect(
          response.status,
        ).toBe(401);
      },
    );

    it(
      'cree le premier SUPER_ADMIN et bloque un second bootstrap',
      async () => {
        const premier =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/auth/bootstrap',
            )
            .send({
              email:
                admin.email,

              motDePasse:
                admin.motDePasse,

              nomAffichage:
                'Administrateur E2E',
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          premier.status,
        );

        expect(
          premier.body.roles,
        ).toContain(
          'SUPER_ADMIN',
        );

        const second =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/auth/bootstrap',
            )
            .send({
              email:
                `second.${suffix}@e2e.test`,

              motDePasse:
                'Deuxieme-Admin-2026!',

              nomAffichage:
                'Deuxieme administrateur',
            });

        expect(
          second.status,
        ).toBe(409);
      },
    );

    it(
      'refuse un mauvais mot de passe et accepte le bon',
      async () => {
        const mauvais =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/auth/login',
            )
            .send({
              email:
                admin.email,

              motDePasse:
                'MauvaisMotDePasse!',
            });

        expect(
          mauvais.status,
        ).toBe(401);

        const login =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/auth/login',
            )
            .send({
              email:
                admin.email,

              motDePasse:
                admin.motDePasse,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          login.status,
        );

        expect(
          login.body.accessToken,
        ).toBeTruthy();

        adminToken =
          login.body.accessToken;
      },
    );

    it(
      'cree le referentiel de test',
      async () => {
        const filiere =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/filieres',
            )
            .set(
              auth(adminToken),
            )
            .send({
              code:
                `FIL-${suffix}`,

              nom:
                `Filiere E2E ${suffix}`,

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          filiere.status,
        );

        filiereId =
          filiere.body.id;

        const formation =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/formations',
            )
            .set(
              auth(adminToken),
            )
            .send({
              code:
                `FOR-${suffix}`,

              nom:
                `Formation E2E ${suffix}`,

              filiereId,

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          formation.status,
        );

        formationId =
          formation.body.id;

        const niveau =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/niveaux',
            )
            .set(
              auth(adminToken),
            )
            .send({
              code:
                `L3-${suffix}`,

              nom:
                'Licence 3 E2E',

              ordre:
                3,

              terminal:
                true,

              formationId,

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          niveau.status,
        );

        niveauId =
          niveau.body.id;

        const classe =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/classes',
            )
            .set(
              auth(adminToken),
            )
            .send({
              code:
                `CL-${suffix}`,

              nom:
                `Classe E2E ${suffix}`,

              annee,

              niveauId,

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          classe.status,
        );

        classeId =
          classe.body.id;

        const cours =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/cours',
            )
            .set(
              auth(adminToken),
            )
            .send({
              code:
                `CRS-${suffix}`,

              intitule:
                'Cours E2E',

              volumeHoraire:
                3,

              credits:
                6,

              semestre:
                1,

              niveauId,

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          cours.status,
        );

        coursId =
          cours.body.id;
      },
    );

    it(
      'cree deux enseignants et verifie isolation des affectations',
      async () => {
        const e1 =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/enseignants',
            )
            .set(
              auth(adminToken),
            )
            .send({
              matricule:
                `ENS1-${suffix}`,

              nom:
                'ENSEIGNANT1',

              prenom:
                'Test',

              email:
                `ens1.${suffix.toLowerCase()}@e2e.test`,

              specialite:
                'Reseaux',

              statut:
                'VACATAIRE',

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          e1.status,
        );

        enseignant1Id =
          e1.body.id;

        const e2 =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/enseignants',
            )
            .set(
              auth(adminToken),
            )
            .send({
              matricule:
                `ENS2-${suffix}`,

              nom:
                'ENSEIGNANT2',

              prenom:
                'Test',

              email:
                `ens2.${suffix.toLowerCase()}@e2e.test`,

              specialite:
                'Systemes',

              statut:
                'VACATAIRE',

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          e2.status,
        );

        enseignant2Id =
          e2.body.id;

        const a1 =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/affectations',
            )
            .set(
              auth(adminToken),
            )
            .send({
              enseignantId:
                enseignant1Id,

              coursId,

              classeId,

              anneeAcademique:
                annee,

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          a1.status,
        );

        affectation1Id =
          a1.body.id;

        const a2 =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/affectations',
            )
            .set(
              auth(adminToken),
            )
            .send({
              enseignantId:
                enseignant2Id,

              coursId,

              classeId,

              anneeAcademique:
                annee,

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          a2.status,
        );

        affectation2Id =
          a2.body.id;

        const compte =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/utilisateurs',
            )
            .set(
              auth(adminToken),
            )
            .send({
              email:
                `compte.ens1.${suffix.toLowerCase()}@e2e.test`,

              motDePasse:
                'Enseignant-E2E-2026!',

              nomAffichage:
                'Enseignant 1 E2E',

              enseignantId:
                enseignant1Id,

              roles: [
                'ENSEIGNANT',
              ],
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          compte.status,
        );

        const login =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/auth/login',
            )
            .send({
              email:
                `compte.ens1.${suffix.toLowerCase()}@e2e.test`,

              motDePasse:
                'Enseignant-E2E-2026!',
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          login.status,
        );

        enseignantToken =
          login.body.accessToken;

        const mesAffectations =
          await request(
            app.getHttpServer(),
          )
            .get(
              '/api/me/enseignant/affectations',
            )
            .set(
              auth(
                enseignantToken,
              ),
            );

        expect(
          mesAffectations.status,
        ).toBe(200);

        expect(
          mesAffectations.body.length,
        ).toBe(1);

        expect(
          mesAffectations.body[0]
            .enseignantId,
        ).toBe(
          enseignant1Id,
        );

        const tentativeInterdite =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/me/enseignant/seances',
            )
            .set(
              auth(
                enseignantToken,
              ),
            )
            .send({
              affectationId:
                affectation2Id,

              dateSeance:
                '2026-09-20',

              heureDebut:
                '08:00',

              heureFin:
                '11:00',

              contenu:
                'Tentative interdite',
            });

        expect(
          tentativeInterdite.status,
        ).toBe(403);

        const maSeance =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/me/enseignant/seances',
            )
            .set(
              auth(
                enseignantToken,
              ),
            )
            .send({
              affectationId:
                affectation1Id,

              dateSeance:
                '2026-09-20',

              heureDebut:
                '08:00',

              heureFin:
                '11:00',

              contenu:
                'Cours E2E autorise',
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          maSeance.status,
        );

        expect(
          maSeance.body.statut,
        ).toBe('DECLAREE');
      },
    );

    it(
      'cree deux etudiants et verifie isolation des donnees',
      async () => {
        const s1 =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/etudiants',
            )
            .set(
              auth(adminToken),
            )
            .send({
              matricule:
                `ETU1-${suffix}`,

              nom:
                'ETUDIANT1',

              prenom:
                'Test',

              email:
                `etu1.${suffix.toLowerCase()}@e2e.test`,

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          s1.status,
        );

        etudiant1Id =
          s1.body.id;

        const s2 =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/etudiants',
            )
            .set(
              auth(adminToken),
            )
            .send({
              matricule:
                `ETU2-${suffix}`,

              nom:
                'ETUDIANT2',

              prenom:
                'Test',

              email:
                `etu2.${suffix.toLowerCase()}@e2e.test`,

              actif:
                true,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          s2.status,
        );

        etudiant2Id =
          s2.body.id;

        const i1 =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/inscriptions',
            )
            .set(
              auth(adminToken),
            )
            .send({
              etudiantId:
                etudiant1Id,

              classeId,

              anneeAcademique:
                annee,

              statut:
                'TERMINEE',
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          i1.status,
        );

        inscription1Id =
          i1.body.id;

        const i2 =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/inscriptions',
            )
            .set(
              auth(adminToken),
            )
            .send({
              etudiantId:
                etudiant2Id,

              classeId,

              anneeAcademique:
                annee,

              statut:
                'TERMINEE',
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          i2.status,
        );

        inscription2Id =
          i2.body.id;

        const compte =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/utilisateurs',
            )
            .set(
              auth(adminToken),
            )
            .send({
              email:
                `compte.etu1.${suffix.toLowerCase()}@e2e.test`,

              motDePasse:
                'Etudiant-E2E-2026!',

              nomAffichage:
                'Etudiant 1 E2E',

              etudiantId:
                etudiant1Id,

              roles: [
                'ETUDIANT',
              ],
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          compte.status,
        );

        const login =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/auth/login',
            )
            .send({
              email:
                `compte.etu1.${suffix.toLowerCase()}@e2e.test`,

              motDePasse:
                'Etudiant-E2E-2026!',
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          login.status,
        );

        etudiantToken =
          login.body.accessToken;

        const mesInscriptions =
          await request(
            app.getHttpServer(),
          )
            .get(
              '/api/me/etudiant/inscriptions',
            )
            .set(
              auth(
                etudiantToken,
              ),
            );

        expect(
          mesInscriptions.status,
        ).toBe(200);

        expect(
          mesInscriptions.body.length,
        ).toBe(1);

        expect(
          mesInscriptions.body[0]
            .etudiantId,
        ).toBe(
          etudiant1Id,
        );

        const generique =
          await request(
            app.getHttpServer(),
          )
            .get(
              '/api/etudiants',
            )
            .set(
              auth(
                etudiantToken,
              ),
            );

        expect(
          generique.status,
        ).toBe(403);
      },
    );

    it(
      'bloque une demande de diplome sur inscription appartenant a un autre etudiant',
      async () => {
        const response =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/diplomes/mes-demandes',
            )
            .set(
              auth(
                etudiantToken,
              ),
            )
            .send({
              inscriptionId:
                inscription2Id,
            });

        expect(
          [
            403,
            409,
          ],
        ).toContain(
          response.status,
        );
      },
    );

    it(
      'execute le workflow complet du diplome',
      async () => {
        const validation =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/eligibilite/validations',
            )
            .set(
              auth(adminToken),
            )
            .send({
              inscriptionId:
                inscription1Id,

              decision:
                'ADMIS',

              creditsObtenus:
                60,

              creditsRequis:
                60,

              stageRequis:
                false,

              stageValide:
                false,

              memoireRequis:
                false,

              memoireValide:
                false,

              dateDeliberation:
                '2026-09-20',

              observations:
                'Validation E2E',
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          validation.status,
        );

        const eligibilite =
          await request(
            app.getHttpServer(),
          )
            .get(
              `/api/eligibilite/inscription/${inscription1Id}`,
            )
            .set(
              auth(adminToken),
            );

        expect(
          eligibilite.status,
        ).toBe(200);

        expect(
          eligibilite.body.eligible,
        ).toBe(true);

        const demande =
          await request(
            app.getHttpServer(),
          )
            .post(
              '/api/diplomes/mes-demandes',
            )
            .set(
              auth(
                etudiantToken,
              ),
            )
            .send({
              inscriptionId:
                inscription1Id,
            });

        expect(
          [
            200,
            201,
          ],
        ).toContain(
          demande.status,
        );

        demandeId =
          demande.body.id;

        const verification =
          await request(
            app.getHttpServer(),
          )
            .patch(
              `/api/diplomes/demandes/${demandeId}/verifier`,
            )
            .set(
              auth(adminToken),
            );

        expect(
          verification.body.statut,
        ).toBe(
          'EN_VERIFICATION',
        );

        const validationDemande =
          await request(
            app.getHttpServer(),
          )
            .patch(
              `/api/diplomes/demandes/${demandeId}/valider`,
            )
            .set(
              auth(adminToken),
            );

        expect(
          validationDemande
            .body.statut,
        ).toBe('VALIDEE');

        const generation =
          await request(
            app.getHttpServer(),
          )
            .post(
              `/api/diplomes/demandes/${demandeId}/generer`,
            )
            .set(
              auth(adminToken),
            );

        expect(
          generation
            .body.statut,
        ).toBe('GENEREE');

        expect(
          generation
            .body.diplome
            ?.numero,
        ).toBeTruthy();

        const signature =
          await request(
            app.getHttpServer(),
          )
            .patch(
              `/api/diplomes/demandes/${demandeId}/signer`,
            )
            .set(
              auth(adminToken),
            );

        expect(
          signature.body.statut,
        ).toBe('SIGNEE');

        const disponible =
          await request(
            app.getHttpServer(),
          )
            .patch(
              `/api/diplomes/demandes/${demandeId}/disponible`,
            )
            .set(
              auth(adminToken),
            );

        expect(
          disponible.body.statut,
        ).toBe('DISPONIBLE');

        const retrait =
          await request(
            app.getHttpServer(),
          )
            .patch(
              `/api/diplomes/demandes/${demandeId}/retirer`,
            )
            .set(
              auth(adminToken),
            )
            .send({
              retirePar:
                'Test automatique E2E',
            });

        expect(
          retrait.body.statut,
        ).toBe('RETIREE');
      },
    );

    it(
      'retourne le reporting et les audits',
      async () => {
        const reporting =
          await request(
            app.getHttpServer(),
          )
            .get(
              `/api/reporting/tableau-de-bord?annee=${annee}`,
            )
            .set(
              auth(adminToken),
            );

        expect(
          reporting.status,
        ).toBe(200);

        expect(
          reporting.body,
        ).toHaveProperty(
          'enseignements',
        );

        expect(
          reporting.body,
        ).toHaveProperty(
          'diplomes',
        );

        const audit =
          await request(
            app.getHttpServer(),
          )
            .get(
              '/api/audit?limite=100',
            )
            .set(
              auth(adminToken),
            );

        expect(
          audit.status,
        ).toBe(200);

        expect(
          Array.isArray(
            audit.body,
          ),
        ).toBe(true);
      },
    );
  },
);
