-- CreateEnum
CREATE TYPE "StatutDemandeDiplome" AS ENUM ('DEMANDEE', 'EN_VERIFICATION', 'A_CORRIGER', 'VALIDEE', 'REJETEE', 'GENEREE', 'SIGNEE', 'DISPONIBLE', 'RETIREE', 'ANNULEE');

-- CreateTable
CREATE TABLE "DemandeDiplome" (
    "id" SERIAL NOT NULL,
    "statut" "StatutDemandeDiplome" NOT NULL DEFAULT 'DEMANDEE',
    "motif" TEXT,
    "dateDemande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateVerification" TIMESTAMP(3),
    "dateValidation" TIMESTAMP(3),
    "dateRejet" TIMESTAMP(3),
    "dateAnnulation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inscriptionId" INTEGER NOT NULL,

    CONSTRAINT "DemandeDiplome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diplome" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "typeDiplome" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "matriculeTitulaire" TEXT NOT NULL,
    "nomTitulaire" TEXT NOT NULL,
    "prenomTitulaire" TEXT NOT NULL,
    "formationLibelle" TEXT NOT NULL,
    "niveauLibelle" TEXT NOT NULL,
    "anneeAcademique" TEXT NOT NULL,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSignature" TIMESTAMP(3),
    "dateDisponibilite" TIMESTAMP(3),
    "dateRetrait" TIMESTAMP(3),
    "retirePar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "demandeId" INTEGER NOT NULL,

    CONSTRAINT "Diplome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemandeDiplome_inscriptionId_key" ON "DemandeDiplome"("inscriptionId");

-- CreateIndex
CREATE INDEX "DemandeDiplome_statut_idx" ON "DemandeDiplome"("statut");

-- CreateIndex
CREATE INDEX "DemandeDiplome_dateDemande_idx" ON "DemandeDiplome"("dateDemande");

-- CreateIndex
CREATE UNIQUE INDEX "Diplome_numero_key" ON "Diplome"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Diplome_demandeId_key" ON "Diplome"("demandeId");

-- CreateIndex
CREATE INDEX "Diplome_numero_idx" ON "Diplome"("numero");

-- CreateIndex
CREATE INDEX "Diplome_matriculeTitulaire_idx" ON "Diplome"("matriculeTitulaire");

-- AddForeignKey
ALTER TABLE "DemandeDiplome" ADD CONSTRAINT "DemandeDiplome_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "InscriptionEtudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diplome" ADD CONSTRAINT "Diplome_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "DemandeDiplome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
