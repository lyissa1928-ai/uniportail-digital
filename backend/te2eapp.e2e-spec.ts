warning: in the working copy of 'test\e2e\app.e2e-spec.ts', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git "a/test\\app.e2e-spec.ts" "b/test\\e2e\\app.e2e-spec.ts"[m
[1mindex fd20981..f2b7018 100644[m
[1m--- "a/test\\app.e2e-spec.ts"[m
[1m+++ "b/test\\e2e\\app.e2e-spec.ts"[m
[36m@@ -1,29 +1,1436 @@[m
[31m-import { Test, TestingModule } from '@nestjs/testing';[m
[31m-import { INestApplication } from '@nestjs/common';[m
[32m+[m[32m﻿import {[m
[32m+[m[32m  beforeAll,[m
[32m+[m[32m  afterAll,[m
[32m+[m[32m  describe,[m
[32m+[m[32m  expect,[m
[32m+[m[32m  it,[m
[32m+[m[32m} from 'vitest';[m
[32m+[m
[32m+[m[32mimport {[m
[32m+[m[32m  ValidationPipe,[m
[32m+[m[32m} from '@nestjs/common';[m
[32m+[m
[32m+[m[32mimport {[m
[32m+[m[32m  Test,[m
[32m+[m[32m} from '@nestjs/testing';[m
[32m+[m
 import request from 'supertest';[m
[31m-import { App } from 'supertest/types';[m
[31m-import { AppModule } from './../src/app.module.js';[m
[31m-[m
[31m-describe('AppController (e2e)', () => {[m
[31m-  let app: INestApplication<App>;[m
[31m-[m
[31m-  beforeEach(async () => {[m
[31m-    const moduleFixture: TestingModule = await Test.createTestingModule({[m
[31m-      imports: [AppModule],[m
[31m-    }).compile();[m
[31m-[m
[31m-    app = moduleFixture.createNestApplication();[m
[31m-    await app.init();[m
[31m-  });[m
[31m-[m
[31m-  it('/ (GET)', () => {[m
[31m-    return request(app.getHttpServer())[m
[31m-      .get('/')[m
[31m-      .expect(200)[m
[31m-      .expect('Hello World!');[m
[31m-  });[m
[31m-[m
[31m-  afterEach(async () => {[m
[31m-    await app.close();[m
[31m-  });[m
[32m+[m
[32m+[m[32mimport dotenv from 'dotenv';[m
[32m+[m
[32m+[m[32mdotenv.config({[m
[32m+[m[32m  path: '.env.test',[m
[32m+[m[32m  override: true,[m
 });[m
[32m+[m
[32m+[m[32mdescribe([m
[32m+[m[32m  'API Suivi Evaluation - E2E',[m
[32m+[m[32m  () => {[m
[32m+[m[32m    let app: any;[m
[32m+[m
[32m+[m[32m    let adminToken = '';[m
[32m+[m[32m    let enseignantToken = '';[m
[32m+[m[32m    let etudiantToken = '';[m
[32m+[m
[32m+[m[32m    const suffix =[m
[32m+[m[32m      Math.random()[m
[32m+[m[32m        .toString(36)[m
[32m+[m[32m        .slice(2, 10)[m
[32m+[m[32m        .toUpperCase();[m
[32m+[m
[32m+[m[32m    const annee =[m
[32m+[m[32m      '2026-2027';[m
[32m+[m
[32m+[m[32m    const admin = {[m
[32m+[m[32m      email:[m
[32m+[m[32m        `admin.${suffix.toLowerCase()}@e2e.test`,[m
[32m+[m
[32m+[m[32m      motDePasse:[m
[32m+[m[32m        'Admin-E2E-2026-Securise!',[m
[32m+[m[32m    };[m
[32m+[m
[32m+[m[32m    let filiereId: number;[m
[32m+[m[32m    let formationId: number;[m
[32m+[m[32m    let niveauId: number;[m
[32m+[m[32m    let classeId: number;[m
[32m+[m[32m    let coursId: number;[m
[32m+[m
[32m+[m[32m    let enseignant1Id: number;[m
[32m+[m[32m    let enseignant2Id: number;[m
[32m+[m
[32m+[m[32m    let affectation1Id: number;[m
[32m+[m[32m    let affectation2Id: number;[m
[32m+[m
[32m+[m[32m    let etudiant1Id: number;[m
[32m+[m[32m    let etudiant2Id: number;[m
[32m+[m
[32m+[m[32m    let inscription1Id: number;[m
[32m+[m[32m    let inscription2Id: number;[m
[32m+[m
[32m+[m[32m    let demandeId: number;[m
[32m+[m
[32m+[m[32m    const auth = ([m
[32m+[m[32m      token: string,[m
[32m+[m[32m    ) => ({[m
[32m+[m[32m      Authorization:[m
[32m+[m[32m        `Bearer ${token}`,[m
[32m+[m[32m    });[m
[32m+[m
[32m+[m[32m    beforeAll([m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const {[m
[32m+[m[32m          AppModule,[m
[32m+[m[32m        } =[m
[32m+[m[32m          await import([m
[32m+[m[32m            '../../src/app.module.js'[m
[32m+[m[32m          );[m
[32m+[m
[32m+[m[32m        const moduleRef =[m
[32m+[m[32m          await Test[m
[32m+[m[32m            .createTestingModule({[m
[32m+[m[32m              imports: [[m
[32m+[m[32m                AppModule,[m
[32m+[m[32m              ],[m
[32m+[m[32m            })[m
[32m+[m[32m            .compile();[m
[32m+[m
[32m+[m[32m        app =[m
[32m+[m[32m          moduleRef[m
[32m+[m[32m            .createNestApplication();[m
[32m+[m
[32m+[m[32m        app.setGlobalPrefix([m
[32m+[m[32m          'api',[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        app.useGlobalPipes([m
[32m+[m[32m          new ValidationPipe({[m
[32m+[m[32m            whitelist: true,[m
[32m+[m
[32m+[m[32m            forbidNonWhitelisted:[m
[32m+[m[32m              true,[m
[32m+[m
[32m+[m[32m            transform: true,[m
[32m+[m
[32m+[m[32m            transformOptions: {[m
[32m+[m[32m              enableImplicitConversion:[m
[32m+[m[32m                true,[m
[32m+[m[32m            },[m
[32m+[m[32m          }),[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        await app.init();[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    afterAll([m
[32m+[m[32m      async () => {[m
[32m+[m[32m        if (app) {[m
[32m+[m[32m          await app.close();[m
[32m+[m[32m        }[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'expose le health check sans authentification',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const response =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .get('/api/health');[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          response.status,[m
[32m+[m[32m        ).toBe(200);[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          response.body.status,[m
[32m+[m[32m        ).toBe('ok');[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'protege les routes privees sans JWT',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const response =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .get([m
[32m+[m[32m              '/api/utilisateurs',[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          response.status,[m
[32m+[m[32m        ).toBe(401);[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'cree le premier SUPER_ADMIN et bloque un second bootstrap',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const premier =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/auth/bootstrap',[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              email:[m
[32m+[m[32m                admin.email,[m
[32m+[m
[32m+[m[32m              motDePasse:[m
[32m+[m[32m                admin.motDePasse,[m
[32m+[m
[32m+[m[32m              nomAffichage:[m
[32m+[m[32m                'Administrateur E2E',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          premier.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          premier.body.roles,[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          'SUPER_ADMIN',[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const second =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/auth/bootstrap',[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              email:[m
[32m+[m[32m                `second.${suffix}@e2e.test`,[m
[32m+[m
[32m+[m[32m              motDePasse:[m
[32m+[m[32m                'Deuxieme-Admin-2026!',[m
[32m+[m
[32m+[m[32m              nomAffichage:[m
[32m+[m[32m                'Deuxieme administrateur',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          second.status,[m
[32m+[m[32m        ).toBe(409);[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'refuse un mauvais mot de passe et accepte le bon',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const mauvais =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/auth/login',[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              email:[m
[32m+[m[32m                admin.email,[m
[32m+[m
[32m+[m[32m              motDePasse:[m
[32m+[m[32m                'MauvaisMotDePasse!',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          mauvais.status,[m
[32m+[m[32m        ).toBe(401);[m
[32m+[m
[32m+[m[32m        const login =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/auth/login',[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              email:[m
[32m+[m[32m                admin.email,[m
[32m+[m
[32m+[m[32m              motDePasse:[m
[32m+[m[32m                admin.motDePasse,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          login.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          login.body.accessToken,[m
[32m+[m[32m        ).toBeTruthy();[m
[32m+[m
[32m+[m[32m        adminToken =[m
[32m+[m[32m          login.body.accessToken;[m
[32m+[m
[32m+[m[32m        // Synchronise les rôles et permissions après la création/login[m
[32m+[m[32m        // du SUPER_ADMIN. Cette étape est nécessaire avant les tests[m
[32m+[m[32m        // des routes protégées par permissions (notamment /api/audit).[m
[32m+[m[32m        const synchronisationSecurite =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/utilisateurs/securite/synchroniser',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        if ([m
[32m+[m[32m          ![[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m            204,[m
[32m+[m[32m          ].includes([m
[32m+[m[32m            synchronisationSecurite.status,[m
[32m+[m[32m          )[m
[32m+[m[32m        ) {[m
[32m+[m[32m          console.error([m
[32m+[m[32m            'SYNCHRONISATION SECURITE STATUS:',[m
[32m+[m[32m            synchronisationSecurite.status,[m
[32m+[m[32m          );[m
[32m+[m
[32m+[m[32m          console.error([m
[32m+[m[32m            'SYNCHRONISATION SECURITE BODY:',[m
[32m+[m[32m            JSON.stringify([m
[32m+[m[32m              synchronisationSecurite.body,[m
[32m+[m[32m              null,[m
[32m+[m[32m              2,[m
[32m+[m[32m            ),[m
[32m+[m[32m          );[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m            204,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          synchronisationSecurite.status,[m
[32m+[m[32m        );[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'cree le referentiel de test',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const filiere =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/filieres',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              code:[m
[32m+[m[32m                `FIL-${suffix}`,[m
[32m+[m
[32m+[m[32m              nom:[m
[32m+[m[32m                `Filiere E2E ${suffix}`,[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          filiere.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        filiereId =[m
[32m+[m[32m          filiere.body.id;[m
[32m+[m
[32m+[m[32m        const formation =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/formations',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              code:[m
[32m+[m[32m                `FOR-${suffix}`,[m
[32m+[m
[32m+[m[32m              nom:[m
[32m+[m[32m                `Formation E2E ${suffix}`,[m
[32m+[m
[32m+[m[32m              filiereId,[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          formation.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        formationId =[m
[32m+[m[32m          formation.body.id;[m
[32m+[m
[32m+[m[32m        const niveau =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/niveaux',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              code:[m
[32m+[m[32m                `L3-${suffix}`,[m
[32m+[m
[32m+[m[32m              nom:[m
[32m+[m[32m                'Licence 3 E2E',[m
[32m+[m
[32m+[m[32m              ordre:[m
[32m+[m[32m                3,[m
[32m+[m
[32m+[m[32m              terminal:[m
[32m+[m[32m                true,[m
[32m+[m
[32m+[m[32m              formationId,[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          niveau.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        niveauId =[m
[32m+[m[32m          niveau.body.id;[m
[32m+[m
[32m+[m[32m        const classe =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/classes',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              code:[m
[32m+[m[32m                `CL-${suffix}`,[m
[32m+[m
[32m+[m[32m              nom:[m
[32m+[m[32m                `Classe E2E ${suffix}`,[m
[32m+[m
[32m+[m[32m              annee,[m
[32m+[m
[32m+[m[32m              niveauId,[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          classe.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        classeId =[m
[32m+[m[32m          classe.body.id;[m
[32m+[m
[32m+[m[32m        const cours =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/cours',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              code:[m
[32m+[m[32m                `CRS-${suffix}`,[m
[32m+[m
[32m+[m[32m              intitule:[m
[32m+[m[32m                'Cours E2E',[m
[32m+[m
[32m+[m[32m              volumeHoraire:[m
[32m+[m[32m                3,[m
[32m+[m
[32m+[m[32m              credits:[m
[32m+[m[32m                6,[m
[32m+[m
[32m+[m[32m              semestre:[m
[32m+[m[32m                1,[m
[32m+[m
[32m+[m[32m              niveauId,[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          cours.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        coursId =[m
[32m+[m[32m          cours.body.id;[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'cree deux enseignants et verifie isolation des affectations',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const e1 =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/enseignants',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              matricule:[m
[32m+[m[32m                `ENS1-${suffix}`,[m
[32m+[m
[32m+[m[32m              nom:[m
[32m+[m[32m                'ENSEIGNANT1',[m
[32m+[m
[32m+[m[32m              prenom:[m
[32m+[m[32m                'Test',[m
[32m+[m
[32m+[m[32m              email:[m
[32m+[m[32m                `ens1.${suffix.toLowerCase()}@e2e.test`,[m
[32m+[m
[32m+[m[32m              specialite:[m
[32m+[m[32m                'Reseaux',[m
[32m+[m
[32m+[m[32m              statut:[m
[32m+[m[32m                'VACATAIRE',[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          e1.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        enseignant1Id =[m
[32m+[m[32m          e1.body.id;[m
[32m+[m
[32m+[m[32m        const e2 =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/enseignants',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              matricule:[m
[32m+[m[32m                `ENS2-${suffix}`,[m
[32m+[m
[32m+[m[32m              nom:[m
[32m+[m[32m                'ENSEIGNANT2',[m
[32m+[m
[32m+[m[32m              prenom:[m
[32m+[m[32m                'Test',[m
[32m+[m
[32m+[m[32m              email:[m
[32m+[m[32m                `ens2.${suffix.toLowerCase()}@e2e.test`,[m
[32m+[m
[32m+[m[32m              specialite:[m
[32m+[m[32m                'Systemes',[m
[32m+[m
[32m+[m[32m              statut:[m
[32m+[m[32m                'VACATAIRE',[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          e2.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        enseignant2Id =[m
[32m+[m[32m          e2.body.id;[m
[32m+[m
[32m+[m[32m        const a1 =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/affectations',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              enseignantId:[m
[32m+[m[32m                enseignant1Id,[m
[32m+[m
[32m+[m[32m              coursId,[m
[32m+[m
[32m+[m[32m              classeId,[m
[32m+[m
[32m+[m[32m              anneeAcademique:[m
[32m+[m[32m                annee,[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          a1.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        affectation1Id =[m
[32m+[m[32m          a1.body.id;[m
[32m+[m
[32m+[m[32m        const a2 =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/affectations',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              enseignantId:[m
[32m+[m[32m                enseignant2Id,[m
[32m+[m
[32m+[m[32m              coursId,[m
[32m+[m
[32m+[m[32m              classeId,[m
[32m+[m
[32m+[m[32m              anneeAcademique:[m
[32m+[m[32m                annee,[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          a2.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        affectation2Id =[m
[32m+[m[32m          a2.body.id;[m
[32m+[m
[32m+[m[32m        const compte =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/utilisateurs',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              email:[m
[32m+[m[32m                `compte.ens1.${suffix.toLowerCase()}@e2e.test`,[m
[32m+[m
[32m+[m[32m              motDePasse:[m
[32m+[m[32m                'Enseignant-E2E-2026!',[m
[32m+[m
[32m+[m[32m              nomAffichage:[m
[32m+[m[32m                'Enseignant 1 E2E',[m
[32m+[m
[32m+[m[32m              enseignantId:[m
[32m+[m[32m                enseignant1Id,[m
[32m+[m
[32m+[m[32m              roles: [[m
[32m+[m[32m                'ENSEIGNANT',[m
[32m+[m[32m              ],[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          compte.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const login =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/auth/login',[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              email:[m
[32m+[m[32m                `compte.ens1.${suffix.toLowerCase()}@e2e.test`,[m
[32m+[m
[32m+[m[32m              motDePasse:[m
[32m+[m[32m                'Enseignant-E2E-2026!',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          login.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        enseignantToken =[m
[32m+[m[32m          login.body.accessToken;[m
[32m+[m
[32m+[m[32m        const mesAffectations =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .get([m
[32m+[m[32m              '/api/me/enseignant/affectations',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth([m
[32m+[m[32m                enseignantToken,[m
[32m+[m[32m              ),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          mesAffectations.status,[m
[32m+[m[32m        ).toBe(200);[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          mesAffectations.body.length,[m
[32m+[m[32m        ).toBe(1);[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          mesAffectations.body[0][m
[32m+[m[32m            .enseignantId,[m
[32m+[m[32m        ).toBe([m
[32m+[m[32m          enseignant1Id,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const tentativeInterdite =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/me/enseignant/seances',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth([m
[32m+[m[32m                enseignantToken,[m
[32m+[m[32m              ),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              affectationId:[m
[32m+[m[32m                affectation2Id,[m
[32m+[m
[32m+[m[32m              dateSeance:[m
[32m+[m[32m                '2026-09-20',[m
[32m+[m
[32m+[m[32m              heureDebut:[m
[32m+[m[32m                '08:00',[m
[32m+[m
[32m+[m[32m              heureFin:[m
[32m+[m[32m                '11:00',[m
[32m+[m
[32m+[m[32m              contenu:[m
[32m+[m[32m                'Tentative interdite',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          tentativeInterdite.status,[m
[32m+[m[32m        ).toBe(403);[m
[32m+[m
[32m+[m[32m        const maSeance =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/me/enseignant/seances',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth([m
[32m+[m[32m                enseignantToken,[m
[32m+[m[32m              ),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              affectationId:[m
[32m+[m[32m                affectation1Id,[m
[32m+[m
[32m+[m[32m              dateSeance:[m
[32m+[m[32m                '2026-09-20',[m
[32m+[m
[32m+[m[32m              heureDebut:[m
[32m+[m[32m                '08:00',[m
[32m+[m
[32m+[m[32m              heureFin:[m
[32m+[m[32m                '11:00',[m
[32m+[m
[32m+[m[32m              contenu:[m
[32m+[m[32m                'Cours E2E autorise',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          maSeance.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          maSeance.body.statut,[m
[32m+[m[32m        ).toBe('DECLAREE');[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'cree deux etudiants et verifie isolation des donnees',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const s1 =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/etudiants',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              matricule:[m
[32m+[m[32m                `ETU1-${suffix}`,[m
[32m+[m
[32m+[m[32m              nom:[m
[32m+[m[32m                'ETUDIANT1',[m
[32m+[m
[32m+[m[32m              prenom:[m
[32m+[m[32m                'Test',[m
[32m+[m
[32m+[m[32m              email:[m
[32m+[m[32m                `etu1.${suffix.toLowerCase()}@e2e.test`,[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          s1.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        etudiant1Id =[m
[32m+[m[32m          s1.body.id;[m
[32m+[m
[32m+[m[32m        const s2 =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/etudiants',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              matricule:[m
[32m+[m[32m                `ETU2-${suffix}`,[m
[32m+[m
[32m+[m[32m              nom:[m
[32m+[m[32m                'ETUDIANT2',[m
[32m+[m
[32m+[m[32m              prenom:[m
[32m+[m[32m                'Test',[m
[32m+[m
[32m+[m[32m              email:[m
[32m+[m[32m                `etu2.${suffix.toLowerCase()}@e2e.test`,[m
[32m+[m
[32m+[m[32m              actif:[m
[32m+[m[32m                true,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          s2.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        etudiant2Id =[m
[32m+[m[32m          s2.body.id;[m
[32m+[m
[32m+[m[32m        const i1 =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/inscriptions',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              etudiantId:[m
[32m+[m[32m                etudiant1Id,[m
[32m+[m
[32m+[m[32m              classeId,[m
[32m+[m
[32m+[m[32m              anneeAcademique:[m
[32m+[m[32m                annee,[m
[32m+[m
[32m+[m[32m              statut:[m
[32m+[m[32m                'TERMINEE',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          i1.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        inscription1Id =[m
[32m+[m[32m          i1.body.id;[m
[32m+[m
[32m+[m[32m        const i2 =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/inscriptions',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              etudiantId:[m
[32m+[m[32m                etudiant2Id,[m
[32m+[m
[32m+[m[32m              classeId,[m
[32m+[m
[32m+[m[32m              anneeAcademique:[m
[32m+[m[32m                annee,[m
[32m+[m
[32m+[m[32m              statut:[m
[32m+[m[32m                'TERMINEE',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          i2.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        inscription2Id =[m
[32m+[m[32m          i2.body.id;[m
[32m+[m
[32m+[m[32m        const compte =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/utilisateurs',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              email:[m
[32m+[m[32m                `compte.etu1.${suffix.toLowerCase()}@e2e.test`,[m
[32m+[m
[32m+[m[32m              motDePasse:[m
[32m+[m[32m                'Etudiant-E2E-2026!',[m
[32m+[m
[32m+[m[32m              nomAffichage:[m
[32m+[m[32m                'Etudiant 1 E2E',[m
[32m+[m
[32m+[m[32m              etudiantId:[m
[32m+[m[32m                etudiant1Id,[m
[32m+[m
[32m+[m[32m              roles: [[m
[32m+[m[32m                'ETUDIANT',[m
[32m+[m[32m              ],[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          compte.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const login =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/auth/login',[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              email:[m
[32m+[m[32m                `compte.etu1.${suffix.toLowerCase()}@e2e.test`,[m
[32m+[m
[32m+[m[32m              motDePasse:[m
[32m+[m[32m                'Etudiant-E2E-2026!',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          login.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        etudiantToken =[m
[32m+[m[32m          login.body.accessToken;[m
[32m+[m
[32m+[m[32m        const mesInscriptions =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .get([m
[32m+[m[32m              '/api/me/etudiant/inscriptions',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth([m
[32m+[m[32m                etudiantToken,[m
[32m+[m[32m              ),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          mesInscriptions.status,[m
[32m+[m[32m        ).toBe(200);[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          mesInscriptions.body.length,[m
[32m+[m[32m        ).toBe(1);[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          mesInscriptions.body[0][m
[32m+[m[32m            .etudiantId,[m
[32m+[m[32m        ).toBe([m
[32m+[m[32m          etudiant1Id,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const generique =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .get([m
[32m+[m[32m              '/api/etudiants',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth([m
[32m+[m[32m                etudiantToken,[m
[32m+[m[32m              ),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          generique.status,[m
[32m+[m[32m        ).toBe(403);[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'bloque une demande de diplome sur inscription appartenant a un autre etudiant',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const response =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/diplomes/mes-demandes',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth([m
[32m+[m[32m                etudiantToken,[m
[32m+[m[32m              ),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              inscriptionId:[m
[32m+[m[32m                inscription2Id,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            403,[m
[32m+[m[32m            409,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          response.status,[m
[32m+[m[32m        );[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'execute le workflow complet du diplome',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const validation =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/eligibilite/validations',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              inscriptionId:[m
[32m+[m[32m                inscription1Id,[m
[32m+[m
[32m+[m[32m              decision:[m
[32m+[m[32m                'ADMIS',[m
[32m+[m
[32m+[m[32m              creditsObtenus:[m
[32m+[m[32m                60,[m
[32m+[m
[32m+[m[32m              creditsRequis:[m
[32m+[m[32m                60,[m
[32m+[m
[32m+[m[32m              stageRequis:[m
[32m+[m[32m                false,[m
[32m+[m
[32m+[m[32m              stageValide:[m
[32m+[m[32m                false,[m
[32m+[m
[32m+[m[32m              memoireRequis:[m
[32m+[m[32m                false,[m
[32m+[m
[32m+[m[32m              memoireValide:[m
[32m+[m[32m                false,[m
[32m+[m
[32m+[m[32m              dateDeliberation:[m
[32m+[m[32m                '2026-09-20',[m
[32m+[m
[32m+[m[32m              observations:[m
[32m+[m[32m                'Validation E2E',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          validation.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const eligibilite =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .get([m
[32m+[m[32m              `/api/eligibilite/inscription/${inscription1Id}`,[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          eligibilite.status,[m
[32m+[m[32m        ).toBe(200);[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          eligibilite.body.eligible,[m
[32m+[m[32m        ).toBe(true);[m
[32m+[m
[32m+[m[32m        const demande =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              '/api/diplomes/mes-demandes',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth([m
[32m+[m[32m                etudiantToken,[m
[32m+[m[32m              ),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              inscriptionId:[m
[32m+[m[32m                inscription1Id,[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          [[m
[32m+[m[32m            200,[m
[32m+[m[32m            201,[m
[32m+[m[32m          ],[m
[32m+[m[32m        ).toContain([m
[32m+[m[32m          demande.status,[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        demandeId =[m
[32m+[m[32m          demande.body.id;[m
[32m+[m
[32m+[m[32m        const verification =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .patch([m
[32m+[m[32m              `/api/diplomes/demandes/${demandeId}/verifier`,[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          verification.body.statut,[m
[32m+[m[32m        ).toBe([m
[32m+[m[32m          'EN_VERIFICATION',[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const validationDemande =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .patch([m
[32m+[m[32m              `/api/diplomes/demandes/${demandeId}/valider`,[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          validationDemande[m
[32m+[m[32m            .body.statut,[m
[32m+[m[32m        ).toBe('VALIDEE');[m
[32m+[m
[32m+[m[32m        const generation =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .post([m
[32m+[m[32m              `/api/diplomes/demandes/${demandeId}/generer`,[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          generation[m
[32m+[m[32m            .body.statut,[m
[32m+[m[32m        ).toBe('GENEREE');[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          generation[m
[32m+[m[32m            .body.diplome[m
[32m+[m[32m            ?.numero,[m
[32m+[m[32m        ).toBeTruthy();[m
[32m+[m
[32m+[m[32m        const signature =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .patch([m
[32m+[m[32m              `/api/diplomes/demandes/${demandeId}/signer`,[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          signature.body.statut,[m
[32m+[m[32m        ).toBe('SIGNEE');[m
[32m+[m
[32m+[m[32m        const disponible =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .patch([m
[32m+[m[32m              `/api/diplomes/demandes/${demandeId}/disponible`,[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          disponible.body.statut,[m
[32m+[m[32m        ).toBe('DISPONIBLE');[m
[32m+[m
[32m+[m[32m        const retrait =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .patch([m
[32m+[m[32m              `/api/diplomes/demandes/${demandeId}/retirer`,[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            )[m
[32m+[m[32m            .send({[m
[32m+[m[32m              retirePar:[m
[32m+[m[32m                'Test automatique E2E',[m
[32m+[m[32m            });[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          retrait.body.statut,[m
[32m+[m[32m        ).toBe('RETIREE');[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m
[32m+[m[32m    it([m
[32m+[m[32m      'retourne le reporting et les audits',[m
[32m+[m[32m      async () => {[m
[32m+[m[32m        const reporting =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .get([m
[32m+[m[32m              `/api/reporting/tableau-de-bord?annee=${annee}`,[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          reporting.status,[m
[32m+[m[32m        ).toBe(200);[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          reporting.body,[m
[32m+[m[32m        ).toHaveProperty([m
[32m+[m[32m          'enseignements',[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          reporting.body,[m
[32m+[m[32m        ).toHaveProperty([m
[32m+[m[32m          'diplomes',[m
[32m+[m[32m        );[m
[32m+[m
[32m+[m[32m        const audit =[m
[32m+[m[32m          await request([m
[32m+[m[32m            app.getHttpServer(),[m
[32m+[m[32m          )[m
[32m+[m[32m            .get([m
[32m+[m[32m              '/api/audit?limite=100',[m
[32m+[m[32m            )[m
[32m+[m[32m            .set([m
[32m+[m[32m              auth(adminToken),[m
[32m+[m[32m            );[m
[32m+[m
[32m+[m[32m        if ([m
[32m+[m[32m          audit.status !== 200[m
[32m+[m[32m        ) {[m
[32m+[m[32m          console.error([m
[32m+[m[32m            'AUDIT STATUS:',[m
[32m+[m[32m            audit.status,[m
[32m+[m[32m          );[m
[32m+[m
[32m+[m[32m          console.error([m
[32m+[m[32m            'AUDIT BODY:',[m
[32m+[m[32m            JSON.stringify([m
[32m+[m[32m              audit.body,[m
[32m+[m[32m              null,[m
[32m+[m[32m              2,[m
[32m+[m[32m            ),[m
[32m+[m[32m          );[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          audit.status,[m
[32m+[m[32m          `La route /api/audit doit etre accessible au SUPER_ADMIN. Reponse: ${JSON.stringify(audit.body)}`,[m
[32m+[m[32m        ).toBe(200);[m
[32m+[m
[32m+[m[32m        expect([m
[32m+[m[32m          Array.isArray([m
[32m+[m[32m            audit.body,[m
[32m+[m[32m          ),[m
[32m+[m[32m        ).toBe(true);[m
[32m+[m[32m      },[m
[32m+[m[32m    );[m
[32m+[m[32m  },[m
[32m+[m[32m);[m
