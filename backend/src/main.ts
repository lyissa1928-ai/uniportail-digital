import {
  ValidationPipe,
} from '@nestjs/common';

import {
  NestFactory,
} from '@nestjs/core';

import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import helmet from 'helmet';
import { randomUUID } from 'node:crypto';

import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  /*
   * Important :
   * Helmet doit être appliqué
   * avant les routes.
   */
  app.use(
    helmet({
      contentSecurityPolicy:
        false,
    }),
  );

  /*
   * Identifiant unique par requête.
   */
  app.use(
    (
      req: any,
      res: any,
      next: any,
    ) => {
      const requestId =
        req.headers[
          'x-request-id'
        ] ??
        randomUUID();

      req.requestId =
        String(requestId);

      res.setHeader(
        'X-Request-Id',
        req.requestId,
      );

      next();
    },
  );

  /*
   * Reverse proxy :
   * activer uniquement
   * si nécessaire.
   */
  if (
    process.env.TRUST_PROXY ===
    'true'
  ) {
    const express =
      app
        .getHttpAdapter()
        .getInstance();

    express.set(
      'trust proxy',
      1,
    );
  }

  /*
   * CORS.
   */
  const corsOrigins =
    (
      process.env.CORS_ORIGINS ??
      ''
    )
      .split(',')
      .map(
        (origin) =>
          origin.trim(),
      )
      .filter(Boolean);

  app.enableCors({
    origin:
      corsOrigins.length > 0
        ? corsOrigins
        : false,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
    ],

    exposedHeaders: [
      'X-Request-Id',
    ],

    credentials:
      false,

    maxAge:
      86400,
  });

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

      stopAtFirstError:
        false,
    }),
  );

  app.useGlobalFilters(
    new AllExceptionsFilter(),
  );

  /*
   * Graceful shutdown.
   */
  app.enableShutdownHooks();

  /*
   * Swagger peut être
   * désactivé en production.
   */
  if (
    process.env
      .SWAGGER_ENABLED !==
    'false'
  ) {
    const swaggerConfig =
      new DocumentBuilder()
        .setTitle(
          'API Suivi Evaluation',
        )
        .setDescription(
          'API de suivi des enseignements, scolarité, éligibilité et gestion des diplômes',
        )
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          'JWT',
        )
        .build();

    const document =
      SwaggerModule.createDocument(
        app,
        swaggerConfig,
      );

    SwaggerModule.setup(
      'api/docs',
      app,
      document,
      {
        swaggerOptions: {
          persistAuthorization:
            true,
        },

        customSiteTitle:
          'Suivi Evaluation API',
      },
    );
  }

  const port =
    Number(
      process.env.PORT ??
      3001,
    );

  await app.listen(port);

  console.log(
    `API disponible sur http://localhost:${port}/api`,
  );

  console.log(
    `Health : http://localhost:${port}/api/health`,
  );

  if (
    process.env
      .SWAGGER_ENABLED !==
    'false'
  ) {
    console.log(
      `Swagger : http://localhost:${port}/api/docs`,
    );
  }
}

bootstrap();
