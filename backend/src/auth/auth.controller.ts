import {
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import { AuthService } from './auth.service.js';
import { BootstrapDto } from './dto/bootstrap.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './decorators/public.decorator.js';
import { UtilisateursService } from '../utilisateurs/utilisateurs.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService:
      AuthService,

    private readonly utilisateurs:
      UtilisateursService,
  ) {}

  @Public()
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
    },
  })
  @Post('bootstrap')
  bootstrap(
    @Body()
    dto: BootstrapDto,
  ) {
    return this.utilisateurs
      .bootstrap(
        dto.email,
        dto.motDePasse,
        dto.nomAffichage,
      );
  }

  @Public()
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Post('login')
  login(
    @Body()
    dto: LoginDto,
  ) {
    return this.authService
      .login(
        dto.email,
        dto.motDePasse,
      );
  }

  @Get('me')
  me(
    @Req()
    request: any,
  ) {
    return request.user;
  }
}
