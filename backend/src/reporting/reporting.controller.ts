import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { Permissions } from '../auth/decorators/permissions.decorator.js';
import { ReportingService } from './reporting.service.js';

@Controller('reporting')
@Permissions('REPORTING_CONSULTER')
export class ReportingController {
  constructor(
    private readonly service:
      ReportingService,
  ) {}

  @Get('tableau-de-bord')
  tableauDeBord(
    @Query('annee')
    annee?: string,
  ) {
    return this.service
      .tableauDeBord(
        annee,
      );
  }

  @Get('synthese')
  synthese() {
    return this.service
      .synthese();
  }
}
