import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { PrismaModule } from './prisma/prisma.module.js';

import { FilieresModule } from './filieres/filieres.module.js';
import { FormationsModule } from './formations/formations.module.js';
import { NiveauxModule } from './niveaux/niveaux.module.js';
import { ClassesModule } from './classes/classes.module.js';
import { CoursModule } from './cours/cours.module.js';

import { EnseignantsModule } from './enseignants/enseignants.module.js';
import { AffectationsModule } from './affectations/affectations.module.js';
import { SeancesModule } from './seances/seances.module.js';

import { PedagogieModule } from './pedagogie/pedagogie.module.js';
import { QhseModule } from './qhse/qhse.module.js';

import { ScolariteModule } from './scolarite/scolarite.module.js';
import { EligibiliteModule } from './eligibilite/eligibilite.module.js';
import { DiplomesModule } from './diplomes/diplomes.module.js';

import { UtilisateursModule } from './utilisateurs/utilisateurs.module.js';
import { AuthModule } from './auth/auth.module.js';

import { AuditModule } from './audit/audit.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ReportingModule } from './reporting/reporting.module.js';

import { HealthModule } from './health/health.module.js';
import { MonEspaceModule } from './mon-espace/mon-espace.module.js';
import { ConsultationModule } from './consultation/consultation.module.js';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';
import { PermissionsGuard } from './auth/guards/permissions.guard.js';

import { ImportEtudiantsModule } from './scolarite/import-etudiants/import-etudiants.module.js';

import { SoutenancesModule } from './scolarite/soutenances/soutenances.module.js';

import { CompteModule } from './compte/compte.module.js';

import { EspaceEtudiantModule } from './espace-etudiant/espace-etudiant.module.js';
@Module({
  imports: [
    EspaceEtudiantModule,
    CompteModule,
    SoutenancesModule,
    ImportEtudiantsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000,
          limit: 120,
        },
      ],
    }),

    PrismaModule,

    FilieresModule,
    FormationsModule,
    NiveauxModule,
    ClassesModule,
    CoursModule,

    EnseignantsModule,
    AffectationsModule,
    SeancesModule,

    PedagogieModule,
    QhseModule,

    ScolariteModule,
    EligibiliteModule,
    DiplomesModule,

    UtilisateursModule,
    AuthModule,

    AuditModule,
    NotificationsModule,
    ReportingModule,

    HealthModule,
    MonEspaceModule,
    ConsultationModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
