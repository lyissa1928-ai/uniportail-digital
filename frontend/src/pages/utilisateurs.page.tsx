import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  api,
  ApiException,
} from '../lib/api';

import { ActualitesManager } from '../components/actualites-manager';

import { AjouterUtilisateurPanel } from '../components/ajouter-utilisateur-panel';

interface Role {
  id?: number;
  code?: string;
  nom?: string;
  description?: string;
  permissions?: Permission[];
}

interface Permission {
  id?: number;
  code?: string;
  nom?: string;
  description?: string;
}

interface Utilisateur {
  id: number;
  email: string;

  nomAffichage?: string;
  actif?: boolean;

  roles?: Array<
    Role | string | {
      role?: Role;
    }
  >;

  enseignant?: {
    matricule?: string;
    nom?: string;
    prenom?: string;
  } | null;

  etudiant?: {
    matricule?: string;
    nom?: string;
    prenom?: string;
  } | null;

  createdAt?: string;
  updatedAt?: string;
}

export function UtilisateursPage() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    utilisateurs,
    setUtilisateurs,
  ] = useState<Utilisateur[]>([]);

  const [
    roles,
    setRoles,
  ] = useState<Role[]>([]);

  const [
    permissions,
    setPermissions,
  ] = useState<Permission[]>([]);

  const [
    usersEndpointAvailable,
    setUsersEndpointAvailable,
  ] = useState(true);

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const userPromise =
            api<unknown>(
              '/utilisateurs',
            )
              .then(
                (value) => {
                  setUsersEndpointAvailable(
                    true,
                  );

                  setUtilisateurs(
                    toArray<Utilisateur>(
                      value,
                    ),
                  );
                },
              )
              .catch(
                () => {
                  setUsersEndpointAvailable(
                    false,
                  );

                  setUtilisateurs([]);
                },
              );

          const rolePromise =
            api<unknown>(
              '/utilisateurs/roles',
            )
              .then(
                (value) =>
                  setRoles(
                    toArray<Role>(
                      value,
                    ),
                  ),
              )
              .catch(
                () =>
                  setRoles([]),
              );

          const permissionPromise =
            api<unknown>(
              '/utilisateurs/permissions',
            )
              .then(
                (value) =>
                  setPermissions(
                    toArray<Permission>(
                      value,
                    ),
                  ),
              )
              .catch(
                () =>
                  setPermissions([]),
              );

          await Promise.all([
            userPromise,
            rolePromise,
            permissionPromise,
          ]);
        }
        catch (err) {
          setError(
            getError(
              err,
              'Chargement des utilisateurs impossible.',
            ),
          );
        }
        finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(
    () => {
      void load();
    },
    [
      load,
    ],
  );

  async function synchroniser() {
    if (
      !window.confirm(
        'Synchroniser strictement les rôles et permissions avec le référentiel de sécurité ?',
      )
    ) {
      return;
    }

    try {
      await api(
        '/utilisateurs/securite/synchroniser',
        {
          method: 'POST',
        },
      );

      setMessage(
        'Référentiel de sécurité synchronisé.',
      );

      setError('');

      await load();

      window.setTimeout(
        () =>
          setMessage(''),
        3000,
      );
    }
    catch (err) {
      setError(
        getError(
          err,
          'Synchronisation impossible.',
        ),
      );
    }
  }

  const query =
    search
      .trim()
      .toLowerCase();

  const filtered =
    useMemo(
      () =>
        utilisateurs.filter(
          (item) =>
            [
              item.email,
              item.nomAffichage,
              item.enseignant
                ?.matricule,
              item.enseignant
                ?.nom,
              item.enseignant
                ?.prenom,
              item.etudiant
                ?.matricule,
              item.etudiant
                ?.nom,
              item.etudiant
                ?.prenom,
              ...roleCodes(
                item,
              ),
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(
                query,
              ),
        ),
      [
        utilisateurs,
        query,
      ],
    );

  const actifs =
    utilisateurs.filter(
      (item) =>
        item.actif !==
        false,
    ).length;

  if (loading) {
    return (
      <section className="panel">
        Chargement de la sécurité...
      </section>
    );
  }

  return (
    <div className="page-stack users-pro-v3">

      <section className="page-header">

        <div>
          <span className="eyebrow">
            Administration
          </span>

          <h1>
            Utilisateurs & sécurité
          </h1>

          <p>
            Comptes, rôles,
            permissions et cohérence
            du référentiel RBAC.
          </p>
        </div>

        <button
          type="button"
          className="primary-button users-sync-pro"
          onClick={() =>
            void synchroniser()
          }
        >
          Synchroniser la sécurité
        </button>

      </section>

      {message && (
        <div className="alert success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <AjouterUtilisateurPanel />

      <section className="stat-grid">

        <article className="stat-card">
          <span>
            Utilisateurs
          </span>

          <strong>
            {utilisateurs.length}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Comptes actifs
          </span>

          <strong>
            {actifs}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Rôles
          </span>

          <strong>
            {roles.length}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Permissions
          </span>

          <strong>
            {permissions.length}
          </strong>
        </article>

      </section>

      <section className="panel">

        <div className="section-title-row">

          <div>
            <h2 className="users-accounts-title">
              Comptes utilisateurs
            </h2>

            <p className="muted">
              Comptes authentifiés et
              rattachements métier.
            </p>
          </div>

          <input
            className="search-input"
            value={search}
            onChange={
              (event) =>
                setSearch(
                  event.target
                    .value,
                )
            }
            placeholder="Rechercher..."
          />

        </div>

        {!usersEndpointAvailable ? (
          <div className="empty-state">
            L'API actuelle ne publie pas
            de route de consultation globale
            des utilisateurs. La sécurité RBAC
            et la synchronisation restent
            néanmoins disponibles.
          </div>
        ) : (
          <div className="table-scroll">

            <table>
              <thead>
                <tr>
                  <th>
                    Utilisateur
                  </th>

                  <th>
                    Profil métier
                  </th>

                  <th>
                    Rôles
                  </th>

                  <th>
                    État
                  </th>

                  <th>
                    Création
                  </th>
                </tr>
              </thead>

              <tbody>
                {
                  filtered.length ===
                  0
                    ? (
                      <tr>
                        <td
                          colSpan={5}
                        >
                          Aucun utilisateur.
                        </td>
                      </tr>
                    )
                    : filtered.map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  item.nomAffichage ??
                                  item.email
                                }
                              </strong>

                              <small className="table-subtitle">
                                {
                                  item.email
                                }
                              </small>
                            </td>

                            <td>
                              {
                                businessProfile(
                                  item,
                                )
                              }
                            </td>

                            <td>
                              <div className="role-badges">
                                {
                                  roleCodes(
                                    item,
                                  ).length ===
                                  0
                                    ? (
                                      <span className="muted">
                                        Aucun rôle
                                      </span>
                                    )
                                    : roleCodes(
                                        item,
                                      ).map(
                                        (role) => (
                                          <span
                                            className="role-badge"
                                            key={
                                              role
                                            }
                                          >
                                            {
                                              role
                                            }
                                          </span>
                                        ),
                                      )
                                }
                              </div>
                            </td>

                            <td>
                              <span
                                className={
                                  item.actif ===
                                  false
                                    ? 'status inactive'
                                    : 'status active'
                                }
                              >
                                {
                                  item.actif ===
                                  false
                                    ? 'Inactif'
                                    : 'Actif'
                                }
                              </span>
                            </td>

                            <td>
                              {
                                formatDate(
                                  item.createdAt,
                                )
                              }
                            </td>
                          </tr>
                        ),
                      )
                }
              </tbody>
            </table>

          </div>
        )}

      </section>

      <section className="security-columns">

        <article className="panel">

          <div className="section-title-row">
            <div>
              <h2 className="users-roles-title">
                Rôles
              </h2>

              <p className="muted">
                Profils d'autorisation
                disponibles.
              </p>
            </div>

            <span className="counter-badge">
              {roles.length}
            </span>
          </div>

          <div className="security-list">

            {
              roles.length ===
              0
                ? (
                  <div className="empty-state">
                    Les rôles ne sont pas
                    exposés par une route
                    de consultation dédiée.
                  </div>
                )
                : roles.map(
                    (
                      role,
                      index,
                    ) => (
                      <article
                        className="security-item"
                        key={
                          role.id ??
                          role.code ??
                          index
                        }
                      >
                        <div>
                          <strong>
                            {
                              role.code ??
                              role.nom ??
                              'ROLE'
                            }
                          </strong>

                          {
                            role.description && (
                              <p>
                                {
                                  role.description
                                }
                              </p>
                            )
                          }
                        </div>

                        {
                          role.permissions && (
                            <span>
                              {
                                role.permissions
                                  .length
                              } permission(s)
                            </span>
                          )
                        }
                      </article>
                    ),
                  )
            }

          </div>

        </article>

        <article className="panel">

          <div className="section-title-row">
            <div>
              <h2 className="users-permissions-title">
                Permissions
              </h2>

              <p className="muted">
                Actions autorisables
                dans la plateforme.
              </p>
            </div>

            <span className="counter-badge">
              {permissions.length}
            </span>
          </div>

          <div className="permission-grid">

            {
              permissions.length ===
              0
                ? (
                  <div className="empty-state">
                    Les permissions ne sont pas
                    exposées par une route
                    de consultation dédiée.
                  </div>
                )
                : permissions.map(
                    (
                      permission,
                      index,
                    ) => (
                      <article
                        className="permission-card"
                        key={
                          permission.id ??
                          permission.code ??
                          index
                        }
                      >
                        <strong>
                          {
                            permission.code ??
                            permission.nom ??
                            'PERMISSION'
                          }
                        </strong>

                        {
                          permission.description && (
                            <p>
                              {
                                permission.description
                              }
                            </p>
                          )
                        }
                      </article>
                    ),
                  )
            }

          </div>

        </article>

      </section>

      <ActualitesManager />

    </div>
  );
}

function roleCodes(
  user:
    Utilisateur,
): string[] {
  if (
    !Array.isArray(
      user.roles,
    )
  ) {
    return [];
  }

  return user.roles
    .map(
      (item): string => {
        if (
          typeof item ===
          'string'
        ) {
          return item;
        }

        if (
          'role' in item &&
          item.role
        ) {
          return (
            item.role.code ??
            item.role.nom ??
            ''
          );
        }

        if (
          'code' in item ||
          'nom' in item
        ) {
          return (
            item.code ??
            item.nom ??
            ''
          );
        }

        return '';
      },
    )
    .filter(
      (
        value,
      ): value is string =>
        value.length > 0,
    );
}

function businessProfile(
  user:
    Utilisateur,
) {
  if (
    user.enseignant
  ) {
    return `Enseignant${user.enseignant.matricule ? ` · ${user.enseignant.matricule}` : ''}`;
  }

  if (
    user.etudiant
  ) {
    return `Étudiant${user.etudiant.matricule ? ` · ${user.etudiant.matricule}` : ''}`;
  }

  return 'Administration';
}

function toArray<T>(
  value:
    unknown,
): T[] {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value as T[];
  }

  if (
    value &&
    typeof value ===
      'object' &&
    'data' in value
  ) {
    const data =
      (
        value as {
          data?: unknown;
        }
      ).data;

    if (
      Array.isArray(
        data,
      )
    ) {
      return data as T[];
    }
  }

  return [];
}

function getError(
  err:
    unknown,
  fallback:
    string,
) {
  return err instanceof
    ApiException
      ? err.message
      : fallback;
}

function formatDate(
  value?:
    string,
) {
  if (!value) {
    return '-';
  }

  const date =
    new Date(
      value,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? value
    : date.toLocaleDateString(
        'fr-FR',
      );
}