import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  api,
  ApiException,
} from '../lib/api';

interface Notification {
  id: number;

  titre?: string;
  message?: string;

  type?: string;

  lue?: boolean;
  lu?: boolean;

  createdAt?: string;
}

export function NotificationsPage() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>(
    [],
  );

  const [
    unread,
    setUnread,
  ] = useState(0);

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const [
            data,
            counter,
          ] =
            await Promise.all([
              api<unknown>(
                '/notifications/me',
              ),

              api<unknown>(
                '/notifications/me/compteur',
              ),
            ]);

          setNotifications(
            toArray<Notification>(
              data,
            ),
          );

          setUnread(
            extractCount(
              counter,
            ),
          );
        }
        catch (err) {
          setError(
            err instanceof
              ApiException
                ? err.message
                : 'Chargement des notifications impossible.',
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

  async function markRead(
    id: number,
  ) {
    try {
      await api(
        `/notifications/${id}/lire`,
        {
          method: 'PATCH',
        },
      );

      await load();
    }
    catch (err) {
      setError(
        getError(
          err,
          'Opération impossible.',
        ),
      );
    }
  }

  async function markAllRead() {
    try {
      await api(
        '/notifications/me/tout-lire',
        {
          method: 'PATCH',
        },
      );

      await load();
    }
    catch (err) {
      setError(
        getError(
          err,
          'Opération impossible.',
        ),
      );
    }
  }

  async function remove(
    id: number,
  ) {
    if (
      !window.confirm(
        'Supprimer cette notification ?',
      )
    ) {
      return;
    }

    try {
      await api(
        `/notifications/${id}`,
        {
          method: 'DELETE',
        },
      );

      await load();
    }
    catch (err) {
      setError(
        getError(
          err,
          'Suppression impossible.',
        ),
      );
    }
  }

  if (loading) {
    return (
      <section className="panel">
        Chargement des notifications...
      </section>
    );
  }

  return (
    <div className="page-stack">

      <section className="page-header">

        <div>
          <span className="eyebrow">
            Mon compte
          </span>

          <h1>
            Notifications
          </h1>

          <p>
            Informations et alertes
            liées à votre activité
            dans la plateforme.
          </p>
        </div>

        {
          unread > 0 && (
            <button
              type="button"
              className="secondary-light-button"
              onClick={() =>
                void markAllRead()
              }
            >
              Tout marquer comme lu
            </button>
          )
        }

      </section>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <section className="stat-grid">

        <article className="stat-card">
          <span>
            Notifications
          </span>

          <strong>
            {
              notifications.length
            }
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Non lues
          </span>

          <strong>
            {unread}
          </strong>
        </article>

      </section>

      <section className="notification-list">

        {
          notifications.length ===
          0
            ? (
              <article className="panel empty-state">
                Aucune notification.
              </article>
            )
            : notifications.map(
                (item) => {
                  const isRead =
                    item.lue ??
                    item.lu ??
                    false;

                  return (
                    <article
                      className={
                        isRead
                          ? 'notification-card'
                          : 'notification-card unread'
                      }
                      key={
                        item.id
                      }
                    >

                      <div className="notification-icon">
                        {
                          notificationInitial(
                            item.type,
                          )
                        }
                      </div>

                      <div className="notification-content">

                        <div className="notification-heading">

                          <div>
                            <strong>
                              {
                                item.titre ??
                                humanize(
                                  item.type ??
                                  'Information',
                                )
                              }
                            </strong>

                            <small>
                              {
                                formatDateTime(
                                  item.createdAt,
                                )
                              }
                            </small>
                          </div>

                          {
                            !isRead && (
                              <span className="unread-dot" />
                            )
                          }

                        </div>

                        <p>
                          {
                            item.message ??
                            'Notification système.'
                          }
                        </p>

                        <div className="notification-actions">

                          {
                            !isRead && (
                              <button
                                type="button"
                                onClick={() =>
                                  void markRead(
                                    item.id,
                                  )
                                }
                              >
                                Marquer comme lue
                              </button>
                            )
                          }

                          <button
                            type="button"
                            className="danger-text-button"
                            onClick={() =>
                              void remove(
                                item.id,
                              )
                            }
                          >
                            Supprimer
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                },
              )
        }

      </section>

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

function extractCount(
  value:
    unknown,
) {
  if (
    typeof value ===
    'number'
  ) {
    return value;
  }

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

    const possible =
      record.compteur ??
      record.count ??
      record.total ??
      record.nonLues;

    if (
      typeof possible ===
      'number'
    ) {
      return possible;
    }
  }

  return 0;
}

function notificationInitial(
  type?:
    string,
) {
  switch (
    type
  ) {
    case 'SUCCES':
      return '✓';

    case 'ALERTE':
      return '!';

    case 'ERREUR':
      return '×';

    default:
      return 'i';
  }
}

function humanize(
  value:
    string,
) {
  return value
    .replaceAll(
      '_',
      ' ',
    )
    .toLowerCase()
    .replace(
      /^./,
      (char) =>
        char.toUpperCase(),
    );
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

  return Number.isNaN(
    date.getTime(),
  )
    ? value
    : date.toLocaleString(
        'fr-FR',
      );
}