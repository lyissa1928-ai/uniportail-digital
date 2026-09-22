-- Ajout des rôles de direction nécessaires au pilotage des soutenances.

INSERT INTO "Role" (
  "code",
  "nom",
  "description",
  "actif",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'DIRECTEUR_ETUDES',
    'Directeur des études',
    'Pilotage pédagogique, soutenances et reporting.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'DIRECTEUR',
    'Directeur',
    'Consultation de pilotage, soutenances et reporting.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("code")
DO UPDATE SET
  "nom" = EXCLUDED."nom",
  "description" = EXCLUDED."description",
  "actif" = TRUE,
  "updatedAt" = CURRENT_TIMESTAMP;

-- Directeur des études
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
JOIN "Permission" p
  ON p."code" IN (
    'PROFIL_LIRE',
    'REFERENTIEL_CONSULTER',
    'ENSEIGNEMENTS_CONSULTER',
    'ENSEIGNEMENTS_GERER',
    'SEANCES_VALIDER',
    'ELIGIBILITE_CONSULTER',
    'ELIGIBILITE_GERER',
    'REPORTING_CONSULTER'
  )
WHERE r."code" = 'DIRECTEUR_ETUDES'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Directeur
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
JOIN "Permission" p
  ON p."code" IN (
    'PROFIL_LIRE',
    'REFERENTIEL_CONSULTER',
    'ENSEIGNEMENTS_CONSULTER',
    'QHSE_CONSULTER',
    'ELIGIBILITE_CONSULTER',
    'REPORTING_CONSULTER'
  )
WHERE r."code" = 'DIRECTEUR'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
