-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER,
    "email" TEXT,
    "roles" JSONB,
    "methode" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ressource" TEXT NOT NULL,
    "ressourceId" TEXT,
    "adresseIp" TEXT,
    "userAgent" TEXT,
    "statusCode" INTEGER NOT NULL,
    "succes" BOOLEAN NOT NULL,
    "messageErreur" TEXT,
    "dureeMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_utilisateurId_idx" ON "AuditLog"("utilisateurId");

-- CreateIndex
CREATE INDEX "AuditLog_ressource_idx" ON "AuditLog"("ressource");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_succes_idx" ON "AuditLog"("succes");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
