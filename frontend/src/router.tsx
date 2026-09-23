import {
  createBrowserRouter,
} from 'react-router';

import {
  ProtectedRoute,
} from './auth/protected-route';

import {
  RequireAccess,
} from './auth/require-access';

import {
  AppLayout,
} from './layouts/app-layout';

import {
  HomePage,
} from './pages/home.page';

import {
  LoginPage,
} from './pages/login.page';

import {
  PublicDiplomaPage,
} from './pages/public-diploma.page';

import {
  PublicLegacyStudentPage,
} from './pages/public-legacy-student.page';

import {
  LegacyStudentsAdminPage,
} from './pages/legacy-students-admin.page';

import {
  DashboardPage,
} from './pages/dashboard.page';

import {
  ReferentielPage,
} from './pages/referentiel.page';

import {
  EnseignementsPage,
} from './pages/enseignements.page';

import {
  PedagogiePage,
} from './pages/pedagogie.page';

import {
  SoutenancesPage,
} from './pages/soutenances.page';

import {
  QhsePage,
} from './pages/qhse.page';

import {
  ScolaritePage,
} from './pages/scolarite.page';

import {
  DiplomesPage,
} from './pages/diplomes.page';

import {
  UtilisateursPage,
} from './pages/utilisateurs.page';

import {
  AuditPage,
} from './pages/audit.page';

import {
  NotificationsPage,
} from './pages/notifications.page';

import {
  BrandingPage,
} from './pages/branding.page';

import {
  MonEspacePage,
} from './pages/mon-espace.page';

import {
  ForbiddenPage,
  NotFoundPage,
} from './pages/errors.page';

export const router =
  createBrowserRouter([
    {
      path: '/',
      element: <HomePage />,
    },

    {
      path: '/login',
      element: <LoginPage />,
    },

    {
      path: '/demande-diplome',
      element: <PublicDiplomaPage />,
    },

    {
      path: '/ancien-etudiant',
      element: <PublicLegacyStudentPage />,
    },

    {
      path: '/403',
      element: <ForbiddenPage />,
    },

    {
      element: <ProtectedRoute />,

      children: [
        {
          element: <AppLayout />,

          children: [
            {
              path: '/dashboard',
              element: <DashboardPage />,
            },

            {
              path: '/referentiel',

              element: (
                <RequireAccess
                  permission="REFERENTIEL_CONSULTER"
                >
                  <ReferentielPage />
                </RequireAccess>
              ),
            },

            {
              path: '/enseignements',

              element: (
                <RequireAccess
                  permission="ENSEIGNEMENTS_CONSULTER"
                >
                  <EnseignementsPage />
                </RequireAccess>
              ),
            },

            {
              path: '/pedagogie',

              element: (
                <RequireAccess
                  permission="SEANCES_VALIDER"
                >
                  <PedagogiePage />
                </RequireAccess>
              ),
            },

            {
              path: '/soutenances',

              element: (
                <RequireAccess
                  anyPermission={[
                    'ELIGIBILITE_CONSULTER',
                    'ELIGIBILITE_GERER',
                  ]}
                >
                  <SoutenancesPage />
                </RequireAccess>
              ),
            },

            {
              path: '/qhse',

              element: (
                <RequireAccess
                  permission="QHSE_CONSULTER"
                >
                  <QhsePage />
                </RequireAccess>
              ),
            },

            {
              path: '/scolarite',

              element: (
                <RequireAccess
                  permission="SCOLARITE_GERER"
                >
                  <ScolaritePage />
                </RequireAccess>
              ),
            },

            {
              path: '/anciens-etudiants',

              element: (
                <RequireAccess
                  permission="SCOLARITE_GERER"
                >
                  <LegacyStudentsAdminPage />
                </RequireAccess>
              ),
            },

            {
              path: '/diplomes',

              element: (
                <RequireAccess
                  anyPermission={[
                    'ELIGIBILITE_CONSULTER',
                    'ELIGIBILITE_GERER',
                    'DIPLOMES_GERER',
                    'DIPLOME_DEMANDER',
                  ]}
                >
                  <DiplomesPage />
                </RequireAccess>
              ),
            },

            {
              path: '/utilisateurs',

              element: (
                <RequireAccess
                  permission="UTILISATEURS_GERER"
                >
                  <UtilisateursPage />
                </RequireAccess>
              ),
            },

            {
              path: '/audit',

              element: (
                <RequireAccess
                  permission="AUDIT_CONSULTER"
                >
                  <AuditPage />
                </RequireAccess>
              ),
            },

            {
              path: '/branding',

              element: (
                <RequireAccess
                  permission="BRANDING_GERER"
                >
                  <BrandingPage />
                </RequireAccess>
              ),
            },

            {
              path: '/notifications',
              element: <NotificationsPage />,
            },

            {
              path: '/me',
              element: <MonEspacePage />,
            },
          ],
        },
      ],
    },

    {
      path: '*',
      element: <NotFoundPage />,
    },
  ]);