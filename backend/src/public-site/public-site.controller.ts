import {
  Controller,
  Get,
} from '@nestjs/common';

import {
  Public,
} from '../auth/decorators/public.decorator.js';

import {
  PublicSiteService,
} from './public-site.service.js';

@Controller('public-site')
export class PublicSiteController {
  constructor(
    private readonly service:
      PublicSiteService,
  ) {}

  @Public()
  @Get('stats')
  stats() {
    return this.service
      .stats();
  }
}
