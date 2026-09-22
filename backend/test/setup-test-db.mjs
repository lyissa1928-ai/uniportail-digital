import 'dotenv/config';

import {
  randomBytes,
} from 'node:crypto';

import {
  writeFileSync,
} from 'node:fs';

import {
  spawnSync,
} from 'node:child_process';

import pg from 'pg';

const {
  Client,
} = pg;

const base =
  process.env.DATABASE_URL;

if (!base) {
  throw new Error(
    'DATABASE_URL est absent du fichier .env',
  );
}

const sourceUrl =
  new URL(base);

const sourceDb =
  decodeURIComponent(
    sourceUrl.pathname
      .replace(/^\//, ''),
  );

if (!sourceDb) {
  throw new Error(
    'Nom de base PostgreSQL introuvable',
  );
}

const testDb =
  sourceDb.endsWith('_test')
    ? sourceDb
    : `${sourceDb}_test`;

if (
  testDb === sourceDb
) {
  console.log(
    `Base de test existante : ${testDb}`,
  );
}

if (
  !testDb.endsWith('_test')
) {
  throw new Error(
    'SECURITE : le nom de la base doit se terminer par _test',
  );
}

const adminUrl =
  new URL(base);

adminUrl.pathname =
  '/postgres';

const client =
  new Client({
    connectionString:
      adminUrl.toString(),
  });

await client.connect();

try {
  await client.query(
    `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1
        AND pid <> pg_backend_pid()
    `,
    [
      testDb,
    ],
  );

  const escapedDb =
    testDb.replace(
      /"/g,
      '""',
    );

  await client.query(
    `DROP DATABASE IF EXISTS "${escapedDb}"`,
  );

  await client.query(
    `CREATE DATABASE "${escapedDb}"`,
  );

  console.log(
    `[OK] Base ${testDb} recreee`,
  );
}
finally {
  await client.end();
}

const testUrl =
  new URL(base);

testUrl.pathname =
  `/${testDb}`;

const jwtSecret =
  randomBytes(64)
    .toString('hex');

writeFileSync(
  '.env.test',
  [
    `DATABASE_URL=${testUrl.toString()}`,
    `JWT_SECRET=${jwtSecret}`,
    'NODE_ENV=test',
    'PORT=3002',
    'SWAGGER_ENABLED=false',
    'TRUST_PROXY=false',
    'CORS_ORIGINS=http://localhost:3000',
    '',
  ].join('\n'),
  {
    encoding: 'utf8',
  },
);

console.log(
  '[OK] .env.test genere',
);

const migration =
  spawnSync(
    'npx',
    [
      'prisma',
      'migrate',
      'deploy',
    ],
    {
      stdio: 'inherit',

      shell: true,

      env: {
        ...process.env,

        DATABASE_URL:
          testUrl.toString(),

        JWT_SECRET:
          jwtSecret,

        NODE_ENV:
          'test',
      },
    },
  );

if (
  migration.status !== 0
) {
  throw new Error(
    'Migration de la base de test echouee',
  );
}

console.log(
  '[OK] Migrations appliquees sur la base de test',
);
