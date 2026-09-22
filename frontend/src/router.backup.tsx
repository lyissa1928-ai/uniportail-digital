import { AdminUtilisateursPage } from './pages/admin-utilisateurs.page';
import {
  Navigate,
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
  DashboardPage,
} from './pages/dashboard.page';

import {
  ForbiddenPage,
  NotFoundPage,
} from './pages/errors.page';

import {
  LoginPage,
} from './pages/login.page';

import {
  ModulePage,
} from './pages/module.page';

import {
  MonEspacePage,
} from './pages/mon-espace.page';


import {
  ReferentielPage,
} from './pages/referentiel.page';

import {
  EnseignementsPage,
} from './pages/enseignements.page';
export const router =
  createBrowserRouter([
  { path: '/admin/utilisateurs', element: <AdminUtilisateursPage /> },
    {
      path:
        '/login',

      element:
        <LoginPage />,
    },

    {
      path:
        '/403',

      element:
        <ForbiddenPage />,
    },

    {
      element:
        <ProtectedRoute />,

      children: [
        {
          element:
            <AppLayout />,

          children: [
            {
              index: true,

              element:
                <Navigate
                  to="/dashboard"
                  replace
                />,
            },

            {
              path:
                '/dashboard',

              element:
                <DashboardPage />,
            },

            {
              path:
                '/referentiel',

              element: (
                <RequireAccess
                  permission="REFERENTIEL_CONSULTER"
                >
                  <ReferentielPage />
                </RequireAccess>
              ),
            },

            {
              path:
                '/enseignements',

              element: (
                <RequireAccess
                  permission="ENSEIGNEMENTS_CONSULTER"
                >
                  <EnseignementsPage />
                </RequireAccess>
              ),
            },

            {
              path:
                '/pedagogie',

              element: (
                <RequireAccess
                  permission="SEANCES_VALIDER"
                >
                  <ModulePage
                    title="PÃƒÆ’Ã‚Â©dagogie"
                    description="Validation des sÃƒÆ’Ã‚Â©ances et contrÃƒÆ’Ã‚Â´le acadÃƒÆ’Ã‚Â©mique."
                  />
                </RequireAccess>
              ),
            },

            {
              path:
                '/qhse',

              element: (
                <RequireAccess
                  permission="QHSE_CONSULTER"
                >
                  <ModulePage
                    title="QHSE"
                    description="Suivi-ÃƒÆ’Ã‚Â©valuation, alertes et indicateurs qualitÃƒÆ’Ã‚Â©."
                  />
                </RequireAccess>
              ),
            },

            {
              path:
                '/scolarite',

              element: (
                <RequireAccess
                  permission="SCOLARITE_GERER"
                >
                  <ModulePage
                    title="ScolaritÃƒÆ’Ã‚Â©"
                    description="ÃƒÆ’Ã¢â‚¬Â°tudiants, inscriptions et parcours acadÃƒÆ’Ã‚Â©miques."
                  />
                </RequireAccess>
              ),
            },

            {
              path:
                '/diplomes',

              element: (
                <RequireAccess
                  anyPermission={[
                    'DIPLOMES_GERER',
                    'DIPLOME_DEMANDER',
                  ]}
                >
                  <ModulePage
                    title="DiplÃƒÆ’Ã‚Â´mes"
                    description="Demandes, validation, gÃƒÆ’Ã‚Â©nÃƒÆ’Ã‚Â©ration, signature et retrait."
                  />
                </RequireAccess>
              ),
            },

            {
              path:
                '/audit',

              element: (
                <RequireAccess
                  permission="AUDIT_CONSULTER"
                >
                  <ModulePage
                    title="Audit"
                    description="TraÃƒÆ’Ã‚Â§abilitÃƒÆ’Ã‚Â© des opÃƒÆ’Ã‚Â©rations sensibles."
                  />
                </RequireAccess>
              ),
            },

            {
              path:
                '/utilisateurs',

              element: (
                <RequireAccess
                  permission="UTILISATEURS_GERER"
                >
                  <ModulePage
                    title="Utilisateurs"
                    description="Comptes, rÃƒÆ’Ã‚Â´les et autorisations."
                  />
                </RequireAccess>
              ),
            },

            {
              path:
                '/me',

              element:
                <MonEspacePage />,
            },
          ],
        },
      ],
    },

    {
      path:
        '*',

      element:
        <NotFoundPage />,
    },
  ]);
