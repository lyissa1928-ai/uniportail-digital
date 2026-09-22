import {
  type ReactNode,
} from 'react';

import { PasswordChangeGate } from '../components/password-change-gate';

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router';

import {
  useAuth,
} from '../auth/auth-context';

type NavigationIcon =
  | 'dashboard'
  | 'referentiel'
  | 'enseignements'
  | 'pedagogie'
  | 'soutenances'
  | 'qhse'
  | 'scolarite'
  | 'diplomes'
  | 'audit'
  | 'utilisateurs'
  | 'profil';

interface NavigationItem {
  label: string;
  path: string;
  icon: NavigationIcon;
  permission?: string;
  anyPermission?: string[];
}

const navigation:
  NavigationItem[] = [
    {
      label:
        'Tableau de bord',
      path:
        '/dashboard',
      icon:
        'dashboard',
    },

    {
      label:
        'Référentiel',
      path:
        '/referentiel',
      icon:
        'referentiel',
      permission:
        'REFERENTIEL_CONSULTER',
    },

    {
      label:
        'Enseignements',
      path:
        '/enseignements',
      icon:
        'enseignements',
      permission:
        'ENSEIGNEMENTS_CONSULTER',
    },

    {
      label:
        'Pédagogie',
      path:
        '/pedagogie',
      icon:
        'pedagogie',
      permission:
        'SEANCES_VALIDER',
    },

    {
      label:
        'Soutenances',
      path:
        '/soutenances',
      icon:
        'soutenances',
      anyPermission: [
        'ELIGIBILITE_CONSULTER',
        'ELIGIBILITE_GERER',
      ],
    },

    {
      label:
        'QHSE',
      path:
        '/qhse',
      icon:
        'qhse',
      permission:
        'QHSE_CONSULTER',
    },

    {
      label:
        'Scolarité',
      path:
        '/scolarite',
      icon:
        'scolarite',
      permission:
        'SCOLARITE_GERER',
    },

    {
      label:
        'Diplômes',
      path:
        '/diplomes',
      icon:
        'diplomes',
      anyPermission: [
        'DIPLOMES_GERER',
        'DIPLOME_DEMANDER',
      ],
    },

    {
      label:
        'Audit',
      path:
        '/audit',
      icon:
        'audit',
      permission:
        'AUDIT_CONSULTER',
    },

    {
      label:
        'Utilisateurs',
      path:
        '/utilisateurs',
      icon:
        'utilisateurs',
      permission:
        'UTILISATEURS_GERER',
    },

    {
      label:
        'Mon espace',
      path:
        '/me',
      icon:
        'profil',
    },
  ];

function NavIcon({
  name,
}: {
  name: NavigationIcon;
}) {
  const paths:
    Record<
      NavigationIcon,
      ReactNode
    > = {
      dashboard: (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      ),

      referentiel: (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
          <path d="M4 5.5v16" />
          <path d="M8 7h8M8 11h8" />
        </>
      ),

      enseignements: (
        <>
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
          <path d="M4 5v16M8 7h7M8 11h7" />
        </>
      ),

      pedagogie: (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A5.5 5.5 0 0 1 9 13a5.5 5.5 0 0 1 3.6 1.35" />
          <path d="m15 17 2 2 4-5" />
        </>
      ),

      soutenances: (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="m9.5 11.2-1 9 3.5-2 3.5 2-1-9" />
          <path d="M9 8h6" />
        </>
      ),

      qhse: (
        <>
          <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </>
      ),

      scolarite: (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2.5" />
          <path d="M5.5 17a3.5 3.5 0 0 1 7 0M15 9h3M15 13h3M15 17h3" />
        </>
      ),

      diplomes: (
        <>
          <path d="m3 8 9-5 9 5-9 5z" />
          <path d="M7 11v5c3 2 7 2 10 0v-5" />
          <path d="M21 8v7" />
        </>
      ),

      audit: (
        <>
          <path d="M9 4h6l1 2h3v15H5V6h3z" />
          <path d="M9 11h6M9 15h6" />
          <path d="m7.5 10.8.7.7 1.3-1.5" />
        </>
      ),

      utilisateurs: (
        <>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2" />
          <path d="M3 20v-1.5A5.5 5.5 0 0 1 9 13a5.5 5.5 0 0 1 6 5.5V20" />
          <path d="M16 14a4.5 4.5 0 0 1 5 4.5V20" />
        </>
      ),

      profil: (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </>
      ),
    };

  return (
    <span
      className="nav-icon"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[name]}
      </svg>
    </span>
  );
}

function initiales(
  value?: string | null,
) {
  if (!value) {
    return 'UP';
  }

  const parts =
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  return value
    .slice(0, 2)
    .toUpperCase();
}

export function AppLayout() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  function allowed(
    item:
      NavigationItem,
  ) {
    if (!user) {
      return false;
    }

    if (
      item.permission &&
      !user.permissions.includes(
        item.permission,
      )
    ) {
      return false;
    }

    if (
      item.anyPermission &&
      !item.anyPermission.some(
        (permission) =>
          user.permissions.includes(
            permission,
          ),
      )
    ) {
      return false;
    }

    return true;
  }

  function deconnexion() {
    logout();

    navigate(
      '/login',
      {
        replace:
          true,
      },
    );
  }

  const visibleNavigation =
    navigation.filter(
      allowed,
    );

  const activeItem =
    visibleNavigation.find(
      (item) =>
        location.pathname ===
          item.path ||
        location.pathname.startsWith(
          `${item.path}/`,
        ),
    ) ??
    visibleNavigation[0];

  const displayName =
    user?.nomAffichage ??
    user?.email ??
    'Utilisateur';

  const primaryRole =
    user?.roles?.[0]
      ?.replaceAll(
        '_',
        ' ',
      ) ??
    'Utilisateur';

  return (
    <div className="app-shell shell-v2">
      <aside className="sidebar sidebar-v2">
        <div className="brand brand-v2">
          <div className="brand-mark">
            UP
          </div>

          <div className="brand-copy">
            <strong>
              UniPortail Digital
            </strong>

            <span>
              Suivi &amp; Évaluation
            </span>
          </div>
        </div>

        <div className="sidebar-context">
          <span className="sidebar-context-dot" />

          <div>
            <small>
              Espace
            </small>

            <strong>
              Administration
            </strong>
          </div>
        </div>

        <div className="nav-caption">
          Navigation
        </div>

        <nav
          className="navigation navigation-v2"
          aria-label="Navigation principale"
        >
          {visibleNavigation.map(
            (item) => (
              <NavLink
                key={
                  item.path
                }
                to={
                  item.path
                }
                className={({
                  isActive,
                }) =>
                  isActive
                    ? 'nav-link active'
                    : 'nav-link'
                }
              >
                <NavIcon
                  name={
                    item.icon
                  }
                />

                <span className="nav-label">
                  {item.label}
                </span>

                <span
                  className="nav-chevron"
                  aria-hidden="true"
                >
                  ›
                </span>
              </NavLink>
            ),
          )}
        </nav>

        <div className="sidebar-footer sidebar-footer-v2">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {initiales(
                user?.nomAffichage ??
                user?.email,
              )}
            </div>

            <div className="sidebar-user-copy">
              <strong>
                {displayName}
              </strong>

              <span>
                {primaryRole}
              </span>
            </div>
          </div>

          <button
            onClick={
              deconnexion
            }
            className="sidebar-logout"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
            </svg>

            <span>
              Déconnexion
            </span>
          </button>
        </div>
      </aside>

      <section className="workspace workspace-v2">
        <header className="topbar topbar-v2">
          <div className="topbar-page">
            <span>
              UniPortail Digital
            </span>

            <strong>
              {activeItem?.label ??
                'Plateforme académique'}
            </strong>
          </div>

          <div className="topbar-right">
            <div className="topbar-status">
              <span className="topbar-status-dot" />

              <div>
                <small>
                  Session active
                </small>

                <strong>
                  Espace sécurisé
                </strong>
              </div>
            </div>

            <div className="topbar-user">
              <div className="topbar-avatar">
                {initiales(
                  user?.nomAffichage ??
                  user?.email,
                )}
              </div>

              <div className="topbar-user-copy">
                <strong>
                  {displayName}
                </strong>

                <span>
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          <PasswordChangeGate>
            <Outlet />
          </PasswordChangeGate>
        </main>
      </section>
    </div>
  );
}
