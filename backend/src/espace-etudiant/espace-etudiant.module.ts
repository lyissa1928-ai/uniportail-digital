import {
  Module,
} from '@nestjs/common';

import {
  PrismaModule,
} from '../prisma/prisma.module.js';

import {
  EspaceEtudiantController,
} from './espace-etudiant.controller.js';

import {
  EspaceEtudiantService,
} from './espace-etudiant.service.js';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    EspaceEtudiantController,
  ],

  providers: [
    EspaceEtudiantService,
  ],
})
export class EspaceEtudiantModule {}