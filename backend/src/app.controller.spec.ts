import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  Test,
  TestingModule,
} from '@nestjs/testing';

import {
  AppController,
} from './app.controller';

import {
  AppService,
} from './app.service';

describe(
  'AppController',
  () => {
    let appController: AppController;

    beforeEach(
      async () => {
        const module: TestingModule =
          await Test
            .createTestingModule({
              controllers: [
                AppController,
              ],

              providers: [
                AppService,
              ],
            })
            .compile();

        appController =
          module.get<AppController>(
            AppController,
          );
      },
    );

    it(
      'doit etre initialise',
      () => {
        expect(
          appController,
        ).toBeDefined();
      },
    );
  },
);