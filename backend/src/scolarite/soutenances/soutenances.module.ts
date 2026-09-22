import {
  Module,
} from '@nestjs/common';

import {
  PrismaModule,
} from '../../prisma/prisma.module.js';

import {
  SoutenancesController,
} from './soutenances.controller.js';

import {
  SoutenancesService,
} from './soutenances.service.js';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    SoutenancesController,
  ],

  providers: [
    SoutenancesService,
  ],
})
export class SoutenancesModule {}