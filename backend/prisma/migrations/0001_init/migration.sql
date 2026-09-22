-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatutSeance" AS ENUM ('DECLAREE', 'VALIDEE', 'REJETEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('ACTIVE', 'SUSPENDUE', 'ABANDONNEE', 'TERMINEE');

-- CreateEnum
CREATE TYPE "DecisionAcademique" AS ENUM ('EN_ATTENTE', 'ADMIS', 'AJOURNE', 'REFUSE');

-- CreateEnum
CREATE TYPE "StatutDemandeDiplome" AS ENUM ('DEMANDEE', 'EN_VERIFICATION', 'A_CORRIGER', 'VALIDEE', 'REJETEE', 'GENEREE', 'SIGNEE', 'DISPONIBLE', 'RETIREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('INFO', 'SUCCES', 'ALERTE', 'ERREUR');

-- CreateEnum
CREATE TYPE "DecisionSoutenance" AS ENUM ('EN_ATTENTE', 'ADMIS', 'AJOURNE', 'REFUSE');

-- CreateTable
CREATE TABLE "Filiere" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formation" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filiereId" INTEGER NOT NULL,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Niveau" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "terminal" BOOLEAN NOT NULL DEFAULT false,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formationId" INTEGER NOT NULL,

    CONSTRAINT "Niveau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classe" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "annee" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "niveauId" INTEGER NOT NULL,

    CONSTRAINT "Classe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cours" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "volumeHoraire" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "niveauId" INTEGER NOT NULL,

    CONSTRAINT "Cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enseignant" (
    "id" SERIAL NOT NULL,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "specialite" TEXT,
    "statut" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enseignant_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "SeanceCours" (
    "id" SERIAL NOT NULL,
    "dateSeance" TIMESTAMP(3) NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "dureeMinutes" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "observations" TEXT,
    "motifRejet" TEXT,
    "valideeLe" TIMESTAMP(3),
    "rejeteeLe" TIMESTAMP(3),
    "statut" "StatutSeance" NOT NULL DEFAULT 'DECLAREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "affectationId" INTEGER NOT NULL,

    CONSTRAINT "SeanceCours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etudiant" (
    "id" SERIAL NOT NULL,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "email" TEXT,
    "telephone" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Etudiant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscriptionEtudiant" (
    "id" SERIAL NOT NULL,
    "anneeAcademique" TEXT NOT NULL,
    "statut" "StatutInscription" NOT NULL DEFAULT 'ACTIVE',
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "classeId" INTEGER NOT NULL,

    CONSTRAINT "InscriptionEtudiant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationAcademique" (
    "id" SERIAL NOT NULL,
    "decision" "DecisionAcademique" NOT NULL DEFAULT 'EN_ATTENTE',
    "creditsObtenus" INTEGER NOT NULL DEFAULT 0,
    "creditsRequis" INTEGER NOT NULL,
    "stageRequis" BOOLEAN NOT NULL DEFAULT false,
    "stageValide" BOOLEAN NOT NULL DEFAULT false,
    "memoireRequis" BOOLEAN NOT NULL DEFAULT false,
    "memoireValide" BOOLEAN NOT NULL DEFAULT false,
    "dateDeliberation" TIMESTAMP(3),
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inscriptionId" INTEGER NOT NULL,

    CONSTRAINT "ValidationAcademique_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "nomAffichage" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "derniereConnexion" TIMESTAMP(3),
    "doitChangerMotDePasse" BOOLEAN NOT NULL DEFAULT false,
    "dateChangementMotDePasse" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "etudiantId" INTEGER,
    "enseignantId" INTEGER,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UtilisateurRole" (
    "utilisateurId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "attribueLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UtilisateurRole_pkey" PRIMARY KEY ("utilisateurId","roleId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

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

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" "TypeNotification" NOT NULL DEFAULT 'INFO',
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lien" TEXT,
    "donnees" JSONB,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "luLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "utilisateurId" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Soutenance" (
    "id" SERIAL NOT NULL,
    "sujet" TEXT NOT NULL,
    "dateSoutenance" TIMESTAMP(3) NOT NULL,
    "decision" "DecisionSoutenance" NOT NULL DEFAULT 'EN_ATTENTE',
    "note" DOUBLE PRECISION,
    "numeroPv" TEXT,
    "presidentJury" TEXT,
    "membresJury" TEXT,
    "observations" TEXT,
    "validee" BOOLEAN NOT NULL DEFAULT false,
    "valideePar" TEXT,
    "dateValidation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inscriptionId" INTEGER NOT NULL,

    CONSTRAINT "Soutenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Filiere_code_key" ON "Filiere"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Formation_code_key" ON "Formation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Niveau_formationId_code_key" ON "Niveau"("formationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Classe_niveauId_code_annee_key" ON "Classe"("niveauId", "code", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "Cours_niveauId_code_key" ON "Cours"("niveauId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Enseignant_matricule_key" ON "Enseignant"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Enseignant_email_key" ON "Enseignant"("email");

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

-- CreateIndex
CREATE INDEX "SeanceCours_affectationId_idx" ON "SeanceCours"("affectationId");

-- CreateIndex
CREATE INDEX "SeanceCours_dateSeance_idx" ON "SeanceCours"("dateSeance");

-- CreateIndex
CREATE INDEX "SeanceCours_statut_idx" ON "SeanceCours"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "SeanceCours_affectationId_dateSeance_heureDebut_key" ON "SeanceCours"("affectationId", "dateSeance", "heureDebut");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_matricule_key" ON "Etudiant"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_email_key" ON "Etudiant"("email");

-- CreateIndex
CREATE INDEX "InscriptionEtudiant_etudiantId_idx" ON "InscriptionEtudiant"("etudiantId");

-- CreateIndex
CREATE INDEX "InscriptionEtudiant_classeId_idx" ON "InscriptionEtudiant"("classeId");

-- CreateIndex
CREATE INDEX "InscriptionEtudiant_anneeAcademique_idx" ON "InscriptionEtudiant"("anneeAcademique");

-- CreateIndex
CREATE INDEX "InscriptionEtudiant_statut_idx" ON "InscriptionEtudiant"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "InscriptionEtudiant_etudiantId_anneeAcademique_key" ON "InscriptionEtudiant"("etudiantId", "anneeAcademique");

-- CreateIndex
CREATE UNIQUE INDEX "ValidationAcademique_inscriptionId_key" ON "ValidationAcademique"("inscriptionId");

-- CreateIndex
CREATE INDEX "ValidationAcademique_decision_idx" ON "ValidationAcademique"("decision");

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

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_etudiantId_key" ON "Utilisateur"("etudiantId");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_enseignantId_key" ON "Utilisateur"("enseignantId");

-- CreateIndex
CREATE INDEX "Utilisateur_email_idx" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Utilisateur_actif_idx" ON "Utilisateur"("actif");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "UtilisateurRole_roleId_idx" ON "UtilisateurRole"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

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

-- CreateIndex
CREATE INDEX "Notification_utilisateurId_idx" ON "Notification"("utilisateurId");

-- CreateIndex
CREATE INDEX "Notification_lu_idx" ON "Notification"("lu");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Soutenance_inscriptionId_key" ON "Soutenance"("inscriptionId");

-- CreateIndex
CREATE INDEX "Soutenance_decision_idx" ON "Soutenance"("decision");

-- CreateIndex
CREATE INDEX "Soutenance_validee_idx" ON "Soutenance"("validee");

-- CreateIndex
CREATE INDEX "Soutenance_dateSoutenance_idx" ON "Soutenance"("dateSoutenance");

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Niveau" ADD CONSTRAINT "Niveau_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cours" ADD CONSTRAINT "Cours_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectationEnseignement" ADD CONSTRAINT "AffectationEnseignement_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectationEnseignement" ADD CONSTRAINT "AffectationEnseignement_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectationEnseignement" ADD CONSTRAINT "AffectationEnseignement_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeanceCours" ADD CONSTRAINT "SeanceCours_affectationId_fkey" FOREIGN KEY ("affectationId") REFERENCES "AffectationEnseignement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscriptionEtudiant" ADD CONSTRAINT "InscriptionEtudiant_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscriptionEtudiant" ADD CONSTRAINT "InscriptionEtudiant_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "Classe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationAcademique" ADD CONSTRAINT "ValidationAcademique_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "InscriptionEtudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeDiplome" ADD CONSTRAINT "DemandeDiplome_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "InscriptionEtudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diplome" ADD CONSTRAINT "Diplome_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "DemandeDiplome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilisateurRole" ADD CONSTRAINT "UtilisateurRole_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilisateurRole" ADD CONSTRAINT "UtilisateurRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Soutenance" ADD CONSTRAINT "Soutenance_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "InscriptionEtudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
