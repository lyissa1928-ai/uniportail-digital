-- Branding configurable de la page de connexion.

CREATE TABLE "BrandingSettings" (
    "id" INTEGER NOT NULL,
    "appName" TEXT NOT NULL DEFAULT 'UniPortail Digital',
    "appSubtitle" TEXT NOT NULL DEFAULT 'Suivi & Évaluation Académique',
    "heroTitle" TEXT NOT NULL DEFAULT 'Un suivi rigoureux pour une réussite durable',
    "heroDescription" TEXT NOT NULL DEFAULT 'UniPortail Digital centralise la gestion des enseignements, des évaluations, de la scolarité et des diplômes dans une interface unique, sécurisée et collaborative.',
    "quoteText" TEXT NOT NULL DEFAULT 'L’enseignement est la clé qui ouvre les portes d’un avenir meilleur.',
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandingSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "BrandingSettings" (
    "id",
    "logoUrl",
    "heroImageUrl",
    "updatedAt"
)
VALUES (
    1,
    '/images/uniportail-logo.webp',
    '/images/login-campus.webp',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Permission" (
    "code",
    "nom",
    "description",
    "createdAt",
    "updatedAt"
)
VALUES (
    'BRANDING_GERER',
    'Gérer l’identité visuelle',
    'Modifier le logo, le visuel de connexion et les textes publics de la plateforme.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("code")
DO UPDATE SET
    "nom" = EXCLUDED."nom",
    "description" = EXCLUDED."description",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
JOIN "Permission" p
  ON p."code" = 'BRANDING_GERER'
WHERE r."code" IN ('SUPER_ADMIN', 'ADMIN')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
