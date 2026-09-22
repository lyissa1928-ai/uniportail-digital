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

interface AuditLog {
  id:
    number | string;

  utilisateurId?: number;
  email?: string;
  roles?: string[] | string;

  method?: string;
  route?: string;
  action?: string;

  resource?: string;
  resourceId?: string;

  ip?: string;
  userAgent?: string;

  status?: number;
  success?: boolean;

  error?: string | null;

  duration?: number;
  createdAt?: string;
  timestamp?: string;
}

export function AuditPage() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    logs,
    setLogs,
  ] = useState<AuditLog[]>([]);

  const [
    statistics,
    setStatistics,
  ] = useState<unknown>(
    null,
  );

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    successFilter,
    setSuccessFilter,
  ] = useState('ALL');

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const [
            logsData,
            statisticsData,
          ] =
            await Promise.all([
              api<unknown>(
                '/audit?limit=100',
              ),

              api<unknown>(
                '/audit/statistiques',
              ),
            ]);

          setLogs(
            toArray<AuditLog>(
              logsData,
            ),
          );

          setStatistics(
            statisticsData,
          );
        }
        catch (err) {
          setError(
            err instanceof
              ApiException
                ? err.message
                : 'Chargement de l’audit impossible.',
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

  const query =
    search
      .trim()
      .toLowerCase();

  const filtered =
    useMemo(
      () =>
        logs.filter(
          (item) => {
            if (
              successFilter ===
                'SUCCESS' &&
              item.success ===
                false
            ) {
              return false;
            }

            if (
              successFilter ===
                'FAILED' &&
              item.success !==
                false
            ) {
              return false;
            }

            return [
              item.email,
              item.method,
              item.route,
              item.action,
              item.resource,
              item.resourceId,
              item.ip,
              item.error,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(
                query,
              );
          },
        ),
      [
        logs,
        query,
        successFilter,
      ],
    );

  const failures =
    logs.filter(
      (item) =>
        item.success ===
        false,
    ).length;

  const successes =
    logs.length -
    failures;

  if (loading) {
    return (
      <section className="panel">
        Chargement de l'audit...
      </section>
    );
  }

  return (
    <div className="page-stack">

      <section className="page-header">

        <div>
          <span className="eyebrow">
            Sécurité
          </span>

          <h1>
            Journal d'audit
          </h1>

          <p>
            Traçabilité des opérations
            sensibles réalisées
            dans la plateforme.
          </p>
        </div>

        <button
          type="button"
          className="secondary-light-button"
          onClick={() =>
            void load()
          }
        >
          Actualiser
        </button>

      </section>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <section className="stat-grid">

        <article className="stat-card">
          <span>
            Événements chargés
          </span>

          <strong>
            {logs.length}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Succès
          </span>

          <strong>
            {successes}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Échecs
          </span>

          <strong>
            {failures}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Taux de succès
          </span>

          <strong>
            {
              logs.length
                ? `${Math.round(
                    successes *
                    100 /
                    logs.length,
                  )}%`
                : '0%'
            }
          </strong>
        </article>

      </section>

      <section className="panel">

        <div className="section-title-row">
          <div>
            <h2>
              Statistiques
            </h2>

            <p className="muted">
              Synthèse calculée
              par le backend.
            </p>
          </div>
        </div>

        <AuditStatistics
          value={
            statistics
          }
        />

      </section>

      <section className="panel table-panel">

        <div className="audit-toolbar">

          <div>
            <h2>
              Événements
            </h2>

            <p className="muted">
              Les contenus sensibles
              des requêtes ne sont pas
              enregistrés.
            </p>
          </div>

          <div className="audit-filters">

            <input
              className="search-input"
              value={
                search
              }
              onChange={
                (event) =>
                  setSearch(
                    event.target
                      .value,
                  )
              }
              placeholder="Utilisateur, route, ressource..."
            />

            <select
              value={
                successFilter
              }
              onChange={
                (event) =>
                  setSuccessFilter(
                    event.target
                      .value,
                  )
              }
            >
              <option value="ALL">
                Tous
              </option>

              <option value="SUCCESS">
                Succès
              </option>

              <option value="FAILED">
                Échecs
              </option>
            </select>

          </div>

        </div>

        <div className="table-scroll">

          <table>
            <thead>
              <tr>
                <th>
                  Date
                </th>

                <th>
                  Utilisateur
                </th>

                <th>
                  Méthode
                </th>

                <th>
                  Action
                </th>

                <th>
                  Ressource
                </th>

                <th>
                  Résultat
                </th>

                <th>
                  Durée
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
                        colSpan={7}
                      >
                        Aucun événement.
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
                            {
                              formatDateTime(
                                item.timestamp ??
                                item.createdAt,
                              )
                            }
                          </td>

                          <td>
                            <strong>
                              {
                                item.email ??
                                '-'
                              }
                            </strong>

                            <small className="table-subtitle">
                              {
                                displayRoles(
                                  item.roles,
                                )
                              }
                            </small>
                          </td>

                          <td>
                            <span
                              className={
                                `http-method method-${(item.method ?? '').toLowerCase()}`
                              }
                            >
                              {
                                item.method ??
                                '-'
                              }
                            </span>
                          </td>

                          <td>
                            {
                              item.action ??
                              item.route ??
                              '-'
                            }
                          </td>

                          <td>
                            {
                              item.resource ??
                              '-'
                            }

                            {
                              item.resourceId && (
                                <small className="table-subtitle">
                                  ID : {
                                    item.resourceId
                                  }
                                </small>
                              )
                            }
                          </td>

                          <td>
                            <span
                              className={
                                item.success ===
                                false
                                  ? 'status audit-failed'
                                  : 'status active'
                              }
                            >
                              {
                                item.success ===
                                false
                                  ? 'Échec'
                                  : 'Succès'
                              }
                            </span>
                          </td>

                          <td>
                            {
                              item.duration !==
                              undefined
                                ? `${item.duration} ms`
                                : '-'
                            }
                          </td>
                        </tr>
                      ),
                    )
              }
            </tbody>
          </table>

        </div>

      </section>

    </div>
  );
}

function AuditStatistics({
  value,
}: {
  value:
    unknown;
}) {
  const record =
    toRecord(
      value,
    );

  const entries =
    Object.entries(
      record,
    ).filter(
      ([
        ,
        item,
      ]) =>
        item === null ||
        typeof item ===
          'number' ||
        typeof item ===
          'string' ||
        typeof item ===
          'boolean',
    );

  if (
    entries.length ===
    0
  ) {
    return (
      <div className="empty-state">
        Aucune statistique.
      </div>
    );
  }

  return (
    <div className="analysis-results">

      {
        entries.map(
          ([
            key,
            item,
          ]) => (
            <article
              className="analysis-result-card"
              key={
                key
              }
            >
              <span>
                {
                  humanize(
                    key,
                  )
                }
              </span>

              <strong>
                {
                  String(
                    item ??
                    '-',
                  )
                }
              </strong>
            </article>
          ),
        )
      }

    </div>
  );
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

function toRecord(
  value:
    unknown,
):
  Record<
    string,
    unknown
  > {
  if (
    value &&
    typeof value ===
      'object' &&
    !Array.isArray(
      value,
    )
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

function humanize(
  value:
    string,
) {
  return value
    .replace(
      /([a-z])([A-Z])/g,
      '$1 $2',
    )
    .replaceAll(
      '_',
      ' ',
    )
    .replace(
      /^./,
      (char) =>
        char.toUpperCase(),
    );
}

function displayRoles(
  value?:
    string[] |
    string,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value.join(
      ', ',
    );
  }

  return value ?? '-';
}

function formatDateTime(
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

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    'fr-FR',
  );
}