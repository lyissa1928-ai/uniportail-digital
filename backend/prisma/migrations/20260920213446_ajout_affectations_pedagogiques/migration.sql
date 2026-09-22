-- CreateTable
CREATE TABLE "AffectationEnseignement" (
    "id" SERIAL NOT NULL,
    "anneeAcademique" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enseignantId" INTEGER NOT NULL,
    "coursId" INTEGER NOT NULL,
    "classeId" INTEGER NOT NULL,

    CONSTRAINT "AffectationEnseignement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AffectationEnseignement_enseignantId_idx" ON "AffectationEnseignement"("enseignantId");

-- CreateIndex
CREATE INDEX "AffectationEnseignement_coursId_idx" ON "AffectationEnseignement"("coursId");

-- CreateIndex
CREATE INDEX "AffectationEnseignement_classeId_idx" ON "AffectationEnseignement"("classeId");

-- CreateIndex
CREATE INDEX "AffectationEnseignement_anneeAcademique_idx" ON "AffectationEnseignement"("anneeAcademique");

-- CreateIndex
CREATE UNIQUE INDEX "AffectationEnseignement_enseignantId_coursId_classeId_annee_key" ON "AffectationEnseignement"("enseignantId", "coursId", "classeId", "anneeAcademique");

-- AddForeignKey
ALTER TABLE "AffectationEnseignement" ADD CONSTRAINT "AffectationEnseignement_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectationEnseignement" ADD CONSTRAINT "AffectationEnseignement_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectationEnseignement" ADD CONSTRAINT "AffectationEnseignement_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
