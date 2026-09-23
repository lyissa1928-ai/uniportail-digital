-- Reconstitution des dossiers d'anciens étudiants.
-- Une demande publique ne devient un dossier officiel qu'après validation de la scolarité.

CREATE TYPE "OrigineDossierEtudiant" AS ENUM ('SYSTEME','IMPORT','ARCHIVE','RECONSTITUTION');
CREATE TYPE "StatutVerificationEtudiant" AS ENUM ('NON_VERIFIE','EN_VERIFICATION','VERIFIE','REJETE');
CREATE TYPE "StatutDemandeAncienEtudiant" AS ENUM ('SOUMISE','EN_VERIFICATION','COMPLEMENT_REQUIS','VALIDEE','REJETEE');
CREATE TYPE "ObjetDemandeAncienEtudiant" AS ENUM (
  'RECONSTITUTION_DOSSIER',
  'INTEGRATION_PARCOURS',
  'DEMANDE_DIPLOME',
  'ATTESTATION_REUSSITE',
  'RELEVE_NOTES',
  'CORRECTION_DONNEES',
  'AUTRE'
);
CREATE TYPE "TypePieceAncienEtudiant" AS ENUM ('IDENTITE','JUSTIFICATIF_ACADEMIQUE');

ALTER TABLE "Etudiant"
  ADD COLUMN "lieuNaissance" TEXT,
  ADD COLUMN "origineDossier" "OrigineDossierEtudiant" NOT NULL DEFAULT 'SYSTEME',
  ADD COLUMN "statutVerification" "StatutVerificationEtudiant" NOT NULL DEFAULT 'VERIFIE';

CREATE TABLE "DemandeAncienEtudiant" (
  "id" SERIAL NOT NULL,
  "reference" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telephone" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "prenom" TEXT NOT NULL,
  "dateNaissance" TIMESTAMP(3) NOT NULL,
  "lieuNaissance" TEXT NOT NULL,
  "matriculeDeclare" TEXT,
  "etablissementLibelle" TEXT NOT NULL,
  "departementLibelle" TEXT,
  "filiereLibelle" TEXT NOT NULL,
  "niveauGrade" TEXT NOT NULL,
  "anneeEntree" INTEGER NOT NULL,
  "anneeSortie" INTEGER,
  "derniereAnneeAcademique" TEXT NOT NULL,
  "diplomePrepare" TEXT NOT NULL,
  "diplomeObtenu" BOOLEAN NOT NULL DEFAULT false,
  "anneeObtention" INTEGER,
  "mention" TEXT,
  "dejaSoutenu" BOOLEAN NOT NULL DEFAULT false,
  "dateSoutenance" TIMESTAMP(3),
  "sujetSoutenance" TEXT,
  "directeurMemoire" TEXT,
  "presidentJury" TEXT,
  "numeroPv" TEXT,
  "attestationReussite" BOOLEAN NOT NULL DEFAULT false,
  "objetDemande" "ObjetDemandeAncienEtudiant" NOT NULL,
  "detailsDemande" TEXT,
  "statut" "StatutDemandeAncienEtudiant" NOT NULL DEFAULT 'SOUMISE',
  "motifTraitement" TEXT,
  "traiteePar" TEXT,
  "matriculeVerifie" TEXT,
  "dateVerification" TIMESTAMP(3),
  "dateDecision" TIMESTAMP(3),
  "confirmationEnvoyeeLe" TIMESTAMP(3),
  "decisionEnvoyeeLe" TIMESTAMP(3),
  "etudiantId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DemandeAncienEtudiant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PieceJustificativeAncienEtudiant" (
  "id" SERIAL NOT NULL,
  "type" "TypePieceAncienEtudiant" NOT NULL,
  "nomOriginal" TEXT NOT NULL,
  "nomStockage" TEXT NOT NULL,
  "cheminStockage" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "tailleOctets" INTEGER NOT NULL,
  "demandeId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PieceJustificativeAncienEtudiant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ParcoursAcademiqueHistorique" (
  "id" SERIAL NOT NULL,
  "etablissementLibelle" TEXT NOT NULL,
  "departementLibelle" TEXT,
  "filiereLibelle" TEXT NOT NULL,
  "niveauGrade" TEXT NOT NULL,
  "anneeEntree" INTEGER NOT NULL,
  "anneeSortie" INTEGER,
  "derniereAnneeAcademique" TEXT NOT NULL,
  "diplomePrepare" TEXT NOT NULL,
  "diplomeObtenu" BOOLEAN NOT NULL DEFAULT false,
  "anneeObtention" INTEGER,
  "mention" TEXT,
  "dejaSoutenu" BOOLEAN NOT NULL DEFAULT false,
  "dateSoutenance" TIMESTAMP(3),
  "sujetSoutenance" TEXT,
  "directeurMemoire" TEXT,
  "presidentJury" TEXT,
  "numeroPv" TEXT,
  "source" "OrigineDossierEtudiant" NOT NULL DEFAULT 'RECONSTITUTION',
  "verifiePar" TEXT,
  "dateVerification" TIMESTAMP(3),
  "etudiantId" INTEGER NOT NULL,
  "sourceDemandeId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ParcoursAcademiqueHistorique_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DemandeAncienEtudiant_reference_key" ON "DemandeAncienEtudiant"("reference");
CREATE INDEX "DemandeAncienEtudiant_email_idx" ON "DemandeAncienEtudiant"("email");
CREATE INDEX "DemandeAncienEtudiant_matriculeDeclare_idx" ON "DemandeAncienEtudiant"("matriculeDeclare");
CREATE INDEX "DemandeAncienEtudiant_statut_idx" ON "DemandeAncienEtudiant"("statut");
CREATE INDEX "DemandeAncienEtudiant_objetDemande_idx" ON "DemandeAncienEtudiant"("objetDemande");
CREATE INDEX "DemandeAncienEtudiant_createdAt_idx" ON "DemandeAncienEtudiant"("createdAt");

CREATE INDEX "PieceJustificativeAncienEtudiant_demandeId_idx" ON "PieceJustificativeAncienEtudiant"("demandeId");
CREATE INDEX "PieceJustificativeAncienEtudiant_type_idx" ON "PieceJustificativeAncienEtudiant"("type");

CREATE UNIQUE INDEX "ParcoursAcademiqueHistorique_sourceDemandeId_key"
  ON "ParcoursAcademiqueHistorique"("sourceDemandeId");
CREATE INDEX "ParcoursAcademiqueHistorique_etudiantId_idx" ON "ParcoursAcademiqueHistorique"("etudiantId");
CREATE INDEX "ParcoursAcademiqueHistorique_anneeEntree_idx" ON "ParcoursAcademiqueHistorique"("anneeEntree");
CREATE INDEX "ParcoursAcademiqueHistorique_anneeSortie_idx" ON "ParcoursAcademiqueHistorique"("anneeSortie");

ALTER TABLE "DemandeAncienEtudiant"
  ADD CONSTRAINT "DemandeAncienEtudiant_etudiantId_fkey"
  FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PieceJustificativeAncienEtudiant"
  ADD CONSTRAINT "PieceJustificativeAncienEtudiant_demandeId_fkey"
  FOREIGN KEY ("demandeId") REFERENCES "DemandeAncienEtudiant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ParcoursAcademiqueHistorique"
  ADD CONSTRAINT "ParcoursAcademiqueHistorique_etudiantId_fkey"
  FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ParcoursAcademiqueHistorique"
  ADD CONSTRAINT "ParcoursAcademiqueHistorique_sourceDemandeId_fkey"
  FOREIGN KEY ("sourceDemandeId") REFERENCES "DemandeAncienEtudiant"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
