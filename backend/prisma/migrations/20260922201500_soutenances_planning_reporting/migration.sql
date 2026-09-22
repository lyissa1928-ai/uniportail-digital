-- Organisation et planification des soutenances
CREATE TYPE "StatutSoutenance" AS ENUM ('PLANIFIEE', 'TENUE', 'REPORTEE', 'ANNULEE');

ALTER TABLE "Soutenance"
ADD COLUMN "heureDebut" TEXT,
ADD COLUMN "heureFin" TEXT,
ADD COLUMN "lieu" TEXT,
ADD COLUMN "statut" "StatutSoutenance" NOT NULL DEFAULT 'PLANIFIEE',
ADD COLUMN "mention" TEXT;

-- Les soutenances déjà décidées ou validées sont considérées comme tenues.
UPDATE "Soutenance"
SET "statut" = 'TENUE'
WHERE "validee" = TRUE
   OR "decision" <> 'EN_ATTENTE';

CREATE INDEX "Soutenance_statut_idx" ON "Soutenance"("statut");
