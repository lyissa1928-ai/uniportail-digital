import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  api,
  ApiException,
} from '../lib/api';

import {
  useAuth,
} from '../auth/auth-context';

import './actualites-manager.css';

type Actualite = {
  id: number;
  titre: string;
  resume: string;
  contenu?: string | null;
  imageUrl?: string | null;
  source:
    | 'PEDAGOGIE'
    | 'SCOLARITE'
    | 'ADMINISTRATION';
  publiee: boolean;
  dateDebut: string;
  dateFin: string;
  createdAt: string;
  auteur?: {
    id?: number;
    email?: string;
    nomAffichage?: string | null;
  };
};

function inputDate(
  date:
    Date,
) {
  const pad = (
    value:
      number,
  ) =>
    String(
      value,
    ).padStart(
      2,
      '0',
    );

  return (
    date.getFullYear() +
    '-' +
    pad(
      date.getMonth() +
      1,
    ) +
    '-' +
    pad(
      date.getDate(),
    ) +
    'T' +
    pad(
      date.getHours(),
    ) +
    ':' +
    pad(
      date.getMinutes(),
    )
  );
}

function defaultDates() {
  const start =
    new Date();

  start.setSeconds(
    0,
    0,
  );

  const end =
    new Date(
      start.getTime() +
      7 *
        24 *
        60 *
        60 *
        1000,
    );

  return {
    dateDebut:
      inputDate(
        start,
      ),

    dateFin:
      inputDate(
        end,
      ),
  };
}

function sourceLabel(
  source:
    Actualite['source'],
) {
  if (
    source ===
    'PEDAGOGIE'
  ) {
    return 'Pédagogie';
  }

  if (
    source ===
    'SCOLARITE'
  ) {
    return 'Scolarité';
  }

  return 'Administration';
}

function statusOf(
  item:
    Actualite,
) {
  const now =
    Date.now();

  const start =
    new Date(
      item.dateDebut,
    ).getTime();

  const end =
    new Date(
      item.dateFin,
    ).getTime();

  if (
    !item.publiee
  ) {
    return {
      label:
        'Masquée',
      tone:
        'muted',
    };
  }

  if (
    now <
    start
  ) {
    return {
      label:
        'Programmée',
      tone:
        'planned',
    };
  }

  if (
    now >=
    end
  ) {
    return {
      label:
        'Expirée',
      tone:
        'expired',
    };
  }

  return {
    label:
      'En ligne',
    tone:
      'live',
  };
}

export function ActualitesManager({
  compact =
    false,
}: {
  compact?: boolean;
}) {
  const {
    user,
  } =
    useAuth();

  const canManage =
    user?.permissions
      ?.includes(
        'ACTUALITES_GERER',
      ) ??
    false;

  const defaults =
    useMemo(
      () =>
        defaultDates(),
      [],
    );

  const [
    items,
    setItems,
  ] =
    useState<Actualite[]>(
      [],
    );

  const [
    titre,
    setTitre,
  ] =
    useState('');

  const [
    resume,
    setResume,
  ] =
    useState('');

  const [
    contenu,
    setContenu,
  ] =
    useState('');

  const [
    dateDebut,
    setDateDebut,
  ] =
    useState(
      defaults.dateDebut,
    );

  const [
    dateFin,
    setDateFin,
  ] =
    useState(
      defaults.dateFin,
    );

  const [
    image,
    setImage,
  ] =
    useState<File | null>(
      null,
    );

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    success,
    setSuccess,
  ] =
    useState('');

  const load =
    useCallback(
      async () => {
        if (
          !canManage
        ) {
          return;
        }

        try {
          const result =
            await api<Actualite[]>(
              '/actualites',
            );

          setItems(
            Array.isArray(
              result,
            )
              ? result
              : [],
          );
        }
        catch {
          setItems([]);
        }
      },
      [
        canManage,
      ],
    );

  useEffect(
    () => {
      void load();
    },
    [
      load,
    ],
  );

  if (
    !canManage
  ) {
    return null;
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      const created =
        await api<Actualite>(
          '/actualites',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                titre:
                  titre.trim(),

                resume:
                  resume.trim(),

                contenu:
                  contenu.trim() ||
                  undefined,

                dateDebut:
                  new Date(
                    dateDebut,
                  )
                    .toISOString(),

                dateFin:
                  new Date(
                    dateFin,
                  )
                    .toISOString(),

                publiee:
                  true,
              }),
          },
        );

      if (image) {
        const formData =
          new FormData();

        formData.append(
          'file',
          image,
        );

        await api(
          `/actualites/${created.id}/image`,
          {
            method:
              'POST',

            body:
              formData,
          },
        );
      }

      const next =
        defaultDates();

      setTitre('');
      setResume('');
      setContenu('');
      setImage(null);
      setDateDebut(
        next.dateDebut,
      );
      setDateFin(
        next.dateFin,
      );

      setSuccess(
        'Actualité publiée. Elle disparaîtra automatiquement à sa date de fin.',
      );

      await load();

      window.setTimeout(
        () =>
          setSuccess(''),
        3500,
      );
    }
    catch (currentError) {
      setError(
        currentError instanceof
          ApiException
          ? currentError.message
          : 'Publication impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function toggle(
    item:
      Actualite,
  ) {
    setBusy(true);
    setError('');

    try {
      await api(
        `/actualites/${item.id}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              publiee:
                !item.publiee,
            }),
        },
      );

      await load();
    }
    catch (currentError) {
      setError(
        currentError instanceof
          ApiException
          ? currentError.message
          : 'Modification impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function remove(
    item:
      Actualite,
  ) {
    if (
      !window.confirm(
        `Supprimer définitivement « ${item.titre} » ?`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      await api(
        `/actualites/${item.id}`,
        {
          method:
            'DELETE',
        },
      );

      await load();
    }
    catch (currentError) {
      setError(
        currentError instanceof
          ApiException
          ? currentError.message
          : 'Suppression impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={
        compact
          ? 'news-manager news-manager-compact'
          : 'news-manager'
      }
    >
      <header className="news-manager-head">
        <div>
          <span className="news-manager-kicker">
            Communication publique
          </span>

          <h2>
            Actualités de la page d’accueil
          </h2>

          <p>
            Publiez une information temporaire. Après la date d’expiration, elle n’est plus visible publiquement.
          </p>
        </div>

        <span className="news-manager-count">
          {items.length}
        </span>
      </header>

      {success && (
        <div className="news-manager-message success">
          {success}
        </div>
      )}

      {error && (
        <div className="news-manager-message error">
          {error}
        </div>
      )}

      <div className="news-manager-layout">
        <form
          className="news-manager-form"
          onSubmit={
            submit
          }
        >
          <label>
            Titre
            <input
              required
              maxLength={180}
              value={titre}
              onChange={
                (event) =>
                  setTitre(
                    event.target
                      .value,
                  )
              }
              placeholder="Ex. Ouverture des inscriptions 2026–2027"
            />
          </label>

          <label>
            Résumé
            <textarea
              required
              maxLength={420}
              rows={3}
              value={resume}
              onChange={
                (event) =>
                  setResume(
                    event.target
                      .value,
                  )
              }
              placeholder="Résumé court affiché sur la page d’accueil"
            />
          </label>

          <label>
            Contenu complémentaire
            <textarea
              maxLength={4000}
              rows={4}
              value={contenu}
              onChange={
                (event) =>
                  setContenu(
                    event.target
                      .value,
                  )
              }
              placeholder="Facultatif"
            />
          </label>

          <div className="news-manager-dates">
            <label>
              Visible à partir du
              <input
                required
                type="datetime-local"
                value={dateDebut}
                onChange={
                  (event) =>
                    setDateDebut(
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Expire le
              <input
                required
                type="datetime-local"
                value={dateFin}
                onChange={
                  (event) =>
                    setDateFin(
                      event.target
                        .value,
                    )
                }
              />
            </label>
          </div>

          <label className="news-manager-file">
            Image de l’actualité
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={
                (event) =>
                  setImage(
                    event.target
                      .files?.[0] ??
                    null,
                  )
              }
            />

            <small>
              JPG, PNG ou WEBP · 5 Mo maximum
            </small>
          </label>

          <button
            type="submit"
            className="news-manager-submit"
            disabled={busy}
          >
            {busy
              ? 'Publication...'
              : 'Publier l’actualité'}
          </button>
        </form>

        <div className="news-manager-list">
          {items.length ===
          0 ? (
            <div className="news-manager-empty">
              Aucune actualité enregistrée.
            </div>
          ) : (
            items
              .slice(
                0,
                8,
              )
              .map(
                (item) => {
                  const status =
                    statusOf(
                      item,
                    );

                  return (
                    <article
                      className="news-manager-item"
                      key={
                        item.id
                      }
                    >
                      {item.imageUrl && (
                        <img
                          src={
                            item.imageUrl
                          }
                          alt=""
                        />
                      )}

                      <div className="news-manager-item-main">
                        <div className="news-manager-item-top">
                          <span
                            className={
                              `news-status ${status.tone}`
                            }
                          >
                            {status.label}
                          </span>

                          <span className="news-source">
                            {sourceLabel(
                              item.source,
                            )}
                          </span>
                        </div>

                        <strong>
                          {item.titre}
                        </strong>

                        <p>
                          {item.resume}
                        </p>

                        <small>
                          Du{' '}
                          {new Date(
                            item.dateDebut,
                          )
                            .toLocaleString(
                              'fr-FR',
                              {
                                dateStyle:
                                  'short',
                                timeStyle:
                                  'short',
                              },
                            )}
                          {' '}au{' '}
                          {new Date(
                            item.dateFin,
                          )
                            .toLocaleString(
                              'fr-FR',
                              {
                                dateStyle:
                                  'short',
                                timeStyle:
                                  'short',
                              },
                            )}
                        </small>

                        <div className="news-manager-actions">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={
                              () =>
                                void toggle(
                                  item,
                                )
                            }
                          >
                            {item.publiee
                              ? 'Masquer'
                              : 'Publier'}
                          </button>

                          <button
                            type="button"
                            className="danger"
                            disabled={busy}
                            onClick={
                              () =>
                                void remove(
                                  item,
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
          )}
        </div>
      </div>
    </section>
  );
}
