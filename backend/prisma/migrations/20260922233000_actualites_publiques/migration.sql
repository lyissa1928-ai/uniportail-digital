-- Actualités publiques temporaires.

CREATE TYPE "SourceActualite" AS ENUM (
  'PEDAGOGIE',
  'SCOLARITE',
  'ADMINISTRATION'
);

CREATE TABLE "Actualite" (
  "id" SERIAL NOT NULL,
  "titre" TEXT NOT NULL,
  "resume" TEXT NOT NULL,
  "contenu" TEXT,
  "imageUrl" TEXT,
  "source" "SourceActualite" NOT NULL,
  "publiee" BOOLEAN NOT NULL DEFAULT TRUE,
  "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dateFin" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "auteurId" INTEGER NOT NULL,

  CONSTRAINT "Actualite_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Actualite"
ADD CONSTRAINT "Actualite_auteurId_fkey"
FOREIGN KEY ("auteurId")
REFERENCES "Utilisateur"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE INDEX "Actualite_publiee_idx"
ON "Actualite"("publiee");

CREATE INDEX "Actualite_dateDebut_idx"
ON "Actualite"("dateDebut");

CREATE INDEX "Actualite_dateFin_idx"
ON "Actualite"("dateFin");

CREATE INDEX "Actualite_source_idx"
ON "Actualite"("source");

CREATE INDEX "Actualite_auteurId_idx"
ON "Actualite"("auteurId");

INSERT INTO "Permission" (
  "code",
  "nom",
  "description",
  "createdAt",
  "updatedAt"
)
VALUES (
  'ACTUALITES_GERER',
  'Gérer les actualités publiques',
  'Créer, modifier et retirer les actualités visibles sur la page d accueil.',
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
  ON p."code" = 'ACTUALITES_GERER'
WHERE r."code" IN (
  'SUPER_ADMIN',
  'ADMIN',
  'PEDAGOGIE',
  'SCOLARITE'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
