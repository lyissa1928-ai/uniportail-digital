import {
  useEffect,
  useMemo,
  useState,
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
  api,
} from '../lib/api';

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
  | 'profil'
  | 'notifications'
  | 'branding';

type NavigationGroup =
  | 'general'
  | 'administration'
  | 'espace';

interface NavigationItem {
  label: string;
  path: string;
  icon: NavigationIcon;
  group: NavigationGroup;
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
      group:
        'general',
    },

    {
      label:
        'Référentiel',
      path:
        '/referentiel',
      icon:
        'referentiel',
      group:
        'general',
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
      group:
        'general',
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
      group:
        'general',
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
      group:
        'general',
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
      group:
        'general',
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
      group:
        'general',
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
      group:
        'general',
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
      group:
        'administration',
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
      group:
        'administration',
      permission:
        'UTILISATEURS_GERER',
    },

    {
      label:
        'Personnalisation',
      path:
        '/branding',
      icon:
        'branding',
      group:
        'administration',
      permission:
        'BRANDING_GERER',
    },

    {
      label:
        'Notifications',
      path:
        '/notifications',
      icon:
        'notifications',
      group:
        'espace',
    },

    {
      label:
        'Mon espace',
      path:
        '/me',
      icon:
        'profil',
      group:
        'espace',
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
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
        </>
      ),

      enseignements: (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
          <path d="M4 5.5v16" />
          <path d="M8 7h8M8 11h8" />
        </>
      ),

      pedagogie: (
        <>
          <path d="m3 9 9-5 9 5-9 5z" />
          <path d="M7 12v4c3 2 7 2 10 0v-4" />
        </>
      ),

      soutenances: (
        <>
          <circle cx="8" cy="9" r="3" />
          <circle cx="16.5" cy="9.5" r="2.5" />
          <path d="M2.5 20v-1.5A5.5 5.5 0 0 1 8 13a5.5 5.5 0 0 1 5.5 5.5V20" />
          <path d="M14 14a4.5 4.5 0 0 1 7.5 3.5V20" />
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
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <circle cx="9" cy="9" r="2.2" />
          <path d="M6 16a3 3 0 0 1 6 0M14.5 8H18M14.5 12H18M14.5 16H18" />
        </>
      ),

      diplomes: (
        <>
          <circle cx="12" cy="9" r="5" />
          <path d="m9 13-1 8 4-2 4 2-1-8" />
        </>
      ),

      audit: (
        <>
          <path d="M9 4h6l1 2h3v15H5V6h3z" />
          <path d="M9 11h6M9 15h6" />
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

      notifications: (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </>
      ),

      branding: (
        <>
          <path d="M12 3a9 9 0 1 0 9 9c0-1.1-.9-2-2-2h-1.5a2.5 2.5 0 0 1-2.5-2.5V6a3 3 0 0 0-3-3z" />
          <circle cx="7.5" cy="10.5" r="1" />
          <circle cx="10" cy="7.5" r="1" />
          <circle cx="8.5" cy="15" r="1" />
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

function SvgIcon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
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

function roleLabel(
  value?: string,
) {
  if (!value) {
    return 'Utilisateur';
  }

  const labels:
    Record<string, string> = {
      SUPER_ADMIN:
        'Super admin',
      ADMIN:
        'Administrateur',
      DIRECTEUR:
        'Directeur',
      DIRECTEUR_ETUDES:
        'Directeur des études',
      PEDAGOGIE:
        'Responsable pédagogique',
      SCOLARITE:
        'Scolarité',
      ENSEIGNANT:
        'Enseignant',
      ETUDIANT:
        'Étudiant',
    };

  return (
    labels[value] ??
    value
      .replaceAll(
        '_',
        ' ',
      )
      .toLowerCase()
  );
}

function extractUnread(
  value: unknown,
) {
  if (
    value &&
    typeof value ===
      'object'
  ) {
    const record =
      value as Record<
        string,
        unknown
      >;

    const count =
      record.nonLues ??
      record.count ??
      record.total;

    if (
      typeof count ===
      'number'
    ) {
      return count;
    }
  }

  return 0;
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

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] =
    useState(false);

  const [
    unread,
    setUnread,
  ] =
    useState(0);

  useEffect(
    () => {
      let mounted =
        true;

      void api<unknown>(
        '/notifications/me/compteur',
      )
        .then(
          (result) => {
            if (mounted) {
              setUnread(
                extractUnread(
                  result,
                ),
              );
            }
          },
        )
        .catch(
          () => {
            if (mounted) {
              setUnread(0);
            }
          },
        );

      return () => {
        mounted =
          false;
      };
    },
    [
      location.pathname,
    ],
  );

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

  const groupedNavigation =
    useMemo(
      () => ({
        general:
          visibleNavigation.filter(
            (item) =>
              item.group ===
              'general',
          ),

        administration:
          visibleNavigation.filter(
            (item) =>
              item.group ===
              'administration',
          ),

        espace:
          visibleNavigation.filter(
            (item) =>
              item.group ===
              'espace',
          ),
      }),
      [
        visibleNavigation,
      ],
    );

  const displayName =
    user?.nomAffichage ??
    user?.email ??
    'Utilisateur';

  const primaryRole =
    roleLabel(
      user?.roles?.[0],
    );

  const navGroup = (
    title: string,
    items:
      NavigationItem[],
  ) => (
    <div className="shell-nav-group">
      <div className="shell-nav-title">
        {title}
      </div>

      <nav className="navigation navigation-v3">
        {items.map(
          (item) => (
            <NavLink
              key={
                item.path
              }
              to={
                item.path
              }
              title={
                sidebarCollapsed
                  ? item.label
                  : undefined
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
    </div>
  );

  return (
    <div
      className={
        sidebarCollapsed
          ? 'app-shell shell-v3 shell-collapsed'
          : 'app-shell shell-v3'
      }
    >
      <aside className="sidebar sidebar-v3">
        <div className="brand brand-v3">
          <div className="brand-mark brand-mark-v3">
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

        <div className="shell-nav-scroll">
          {navGroup(
            'Général',
            groupedNavigation.general,
          )}

          {groupedNavigation
            .administration
            .length > 0 &&
            navGroup(
              'Administration',
              groupedNavigation
                .administration,
            )}

          {navGroup(
            'Mon espace',
            groupedNavigation.espace,
          )}
        </div>

        <div className="sidebar-footer sidebar-footer-v3">
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

            <span
              className="sidebar-user-chevron"
              aria-hidden="true"
            >
              ›
            </span>
          </div>

          <button
            onClick={
              deconnexion
            }
            className="sidebar-logout"
            type="button"
          >
            <SvgIcon>
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
            </SvgIcon>

            <span>
              Déconnexion
            </span>
          </button>
        </div>
      </aside>

      <section className="workspace workspace-v3">
        <header className="topbar topbar-v3">
          <div className="topbar-left-v3">
            <button
              type="button"
              className="topbar-icon-button menu-button"
              aria-label="Réduire ou agrandir le menu"
              onClick={
                () =>
                  setSidebarCollapsed(
                    (value) =>
                      !value,
                  )
              }
            >
              <SvgIcon>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </SvgIcon>
            </button>

            <div className="global-search">
              <SvgIcon>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </SvgIcon>

              <input
                type="search"
                aria-label="Recherche globale"
                placeholder="Rechercher un étudiant, un enseignant, une formation..."
              />

              <kbd>
                ⌘ K
              </kbd>
            </div>
          </div>

          <div className="topbar-right-v3">
            <button
              type="button"
              className="academic-year-control"
              title="Année académique active"
            >
              <span className="academic-year-icon">
                <SvgIcon>
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </SvgIcon>
              </span>

              <span className="academic-year-copy">
                <small>
                  Année académique
                </small>

                <strong>
                  2026 – 2027
                </strong>
              </span>

              <span className="academic-year-chevron">
                ⌄
              </span>
            </button>

            <button
              type="button"
              className="topbar-action"
              aria-label="Notifications"
              title="Notifications"
              onClick={
                () =>
                  navigate(
                    '/notifications',
                  )
              }
            >
              <SvgIcon>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </SvgIcon>

              {unread > 0 && (
                <span className="notification-badge">
                  {unread > 99
                    ? '99+'
                    : unread}
                </span>
              )}
            </button>

            <button
              type="button"
              className="topbar-action"
              aria-label="Messages"
              title="Centre de messages"
              onClick={
                () =>
                  navigate(
                    '/notifications',
                  )
              }
            >
              <SvgIcon>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </SvgIcon>
            </button>

            <span className="topbar-divider" />

            <button
              type="button"
              className="topbar-profile"
              onClick={
                () =>
                  navigate(
                    '/me',
                  )
              }
            >
              <span className="topbar-avatar">
                {initiales(
                  user?.nomAffichage ??
                  user?.email,
                )}
              </span>

              <span className="topbar-profile-copy">
                <strong>
                  {displayName}
                </strong>

                <small>
                  {primaryRole}
                </small>
              </span>

              <span className="topbar-profile-chevron">
                ⌄
              </span>
            </button>
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
