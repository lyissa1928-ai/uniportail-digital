-- Demandes publiques de diplômes lorsque le demandeur n'est pas retrouvé
-- dans le référentiel étudiant interne.

CREATE TYPE "TypeDemandeDiplomeExterne" AS ENUM (
  'PREMIERE_DEMANDE',
  'DUPLICATA'
);

CREATE TYPE "StatutDemandeDiplomeExterne" AS ENUM (
  'DEMANDEE',
  'EN_VERIFICATION',
  'DISPONIBLE',
  'REJETEE'
);

CREATE TABLE "DemandeDiplomeExterne" (
  "id" SERIAL NOT NULL,
  "reference" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "matricule" TEXT,
  "nom" TEXT NOT NULL,
  "prenom" TEXT NOT NULL,
  "dateNaissance" TIMESTAMP(3) NOT NULL,
  "anneeObtention" INTEGER NOT NULL,
  "intituleDiplome" TEXT NOT NULL,
  "typeDemande" "TypeDemandeDiplomeExterne" NOT NULL,
  "statut" "StatutDemandeDiplomeExterne" NOT NULL DEFAULT 'DEMANDEE',
  "motif" TEXT,
  "traiteePar" TEXT,
  "dateValidation" TIMESTAMP(3),
  "dateDisponibilite" TIMESTAMP(3),
  "confirmationEnvoyeeLe" TIMESTAMP(3),
  "disponibiliteEnvoyeeLe" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DemandeDiplomeExterne_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DemandeDiplomeExterne_reference_key"
ON "DemandeDiplomeExterne"("reference");

CREATE INDEX "DemandeDiplomeExterne_email_idx"
ON "DemandeDiplomeExterne"("email");

CREATE INDEX "DemandeDiplomeExterne_matricule_idx"
ON "DemandeDiplomeExterne"("matricule");

CREATE INDEX "DemandeDiplomeExterne_statut_idx"
ON "DemandeDiplomeExterne"("statut");

CREATE INDEX "DemandeDiplomeExterne_dateDisponibilite_idx"
ON "DemandeDiplomeExterne"("dateDisponibilite");

CREATE INDEX "DemandeDiplomeExterne_createdAt_idx"
ON "DemandeDiplomeExterne"("createdAt");
