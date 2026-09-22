import {
  Controller,
  Get,
} from '@nestjs/common';

import { Public } from './auth/decorators/public.decorator.js';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService:
      AppService,
  ) {}

  @Public()
  @Get()
  accueil() {
    return {
      application:
        'Suivi Evaluation API',

      statut:
        'ONLINE',

      version:
        '1.0',

      endpoints: {
        health:
          '/api/health',

        documentation:
          '/api/docs',

        login:
          '/api/auth/login',
      },

      timestamp:
        new Date().toISOString(),
    };
  }
}
