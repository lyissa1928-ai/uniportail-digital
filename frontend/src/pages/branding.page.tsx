import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  api,
  ApiException,
} from '../lib/api';

type BrandingSettings = {
  id: number;
  appName: string;
  appSubtitle: string;
  heroTitle: string;
  heroDescription: string;
  quoteText: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  updatedBy?: string | null;
  updatedAt?: string;
};

function absoluteAsset(
  value?: string | null,
) {
  if (!value) {
    return '';
  }

  return value;
}

export function BrandingPage() {
  const [
    branding,
    setBranding,
  ] =
    useState<BrandingSettings | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState({
      appName:
        '',
      appSubtitle:
        '',
      heroTitle:
        '',
      heroDescription:
        '',
      quoteText:
        '',
    });

  const [
    loading,
    setLoading,
  ] =
    useState(true);

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
    message,
    setMessage,
  ] =
    useState('');

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const result =
            await api<BrandingSettings>(
              '/branding',
            );

          setBranding(
            result,
          );

          setForm({
            appName:
              result.appName,
            appSubtitle:
              result.appSubtitle,
            heroTitle:
              result.heroTitle,
            heroDescription:
              result.heroDescription,
            quoteText:
              result.quoteText,
          });
        }
        catch (currentError) {
          setError(
            currentError instanceof
              ApiException
              ? currentError.message
              : 'Chargement de l’identité visuelle impossible.',
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

  function notify(
    value: string,
  ) {
    setMessage(
      value,
    );
    setError('');

    window.setTimeout(
      () =>
        setMessage(''),
      3000,
    );
  }

  async function save(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const result =
        await api<BrandingSettings>(
          '/branding',
          {
            method:
              'PATCH',

            body:
              JSON.stringify(
                form,
              ),
          },
        );

      setBranding(
        result,
      );

      notify(
        'Identité visuelle enregistrée.',
      );
    }
    catch (currentError) {
      setError(
        currentError instanceof
          ApiException
          ? currentError.message
          : 'Enregistrement impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function upload(
    kind:
      'logo' |
      'hero',
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value =
      '';

    if (!file) {
      return;
    }

    const max =
      kind ===
      'logo'
        ? 5
        : 8;

    if (
      file.size >
      max *
        1024 *
        1024
    ) {
      setError(
        `Fichier trop volumineux. Maximum ${max} Mo.`,
      );

      return;
    }

    const body =
      new FormData();

    body.append(
      'file',
      file,
    );

    setBusy(true);
    setError('');

    try {
      const result =
        await api<BrandingSettings>(
          `/branding/${kind}`,
          {
            method:
              'POST',
            body,
          },
        );

      setBranding(
        result,
      );

      notify(
        kind ===
        'logo'
          ? 'Logo mis à jour.'
          : 'Image de connexion mise à jour.',
      );
    }
    catch (currentError) {
      setError(
        currentError instanceof
          ApiException
          ? currentError.message
          : 'Téléversement impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function restore() {
    if (
      !window.confirm(
        'Restaurer le logo, le visuel et les textes par défaut ?',
      )
    ) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      const result =
        await api<BrandingSettings>(
          '/branding/restaurer',
          {
            method:
              'POST',
          },
        );

      setBranding(
        result,
      );

      setForm({
        appName:
          result.appName,
        appSubtitle:
          result.appSubtitle,
        heroTitle:
          result.heroTitle,
        heroDescription:
          result.heroDescription,
        quoteText:
          result.quoteText,
      });

      notify(
        'Identité par défaut restaurée.',
      );
    }
    catch (currentError) {
      setError(
        currentError instanceof
          ApiException
          ? currentError.message
          : 'Restauration impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="panel">
        Chargement de l’identité visuelle...
      </section>
    );
  }

  return (
    <div className="page-stack branding-admin">
      <section className="branding-admin-hero">
        <div>
          <span className="eyebrow">
            Administration
          </span>

          <h1>
            Identité visuelle
          </h1>

          <p>
            Personnalisez la page de connexion sans modifier le code de la plateforme.
          </p>
        </div>

        <button
          type="button"
          className="secondary-light-button"
          disabled={busy}
          onClick={
            () =>
              void restore()
          }
        >
          Restaurer par défaut
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

      <section className="branding-admin-grid">
        <form
          className="panel branding-form-panel"
          onSubmit={
            save
          }
        >
          <div className="branding-panel-heading">
            <div>
              <h2>
                Textes publics
              </h2>

              <p>
                Ces contenus sont visibles avant authentification.
              </p>
            </div>
          </div>

          <div className="branding-form-grid">
            <label>
              Nom de la plateforme
              <input
                required
                maxLength={120}
                value={
                  form.appName
                }
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      appName:
                        event.target.value,
                    })
                }
              />
            </label>

            <label>
              Sous-titre
              <input
                required
                maxLength={180}
                value={
                  form.appSubtitle
                }
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      appSubtitle:
                        event.target.value,
                    })
                }
              />
            </label>

            <label>
              Titre principal
              <textarea
                required
                maxLength={220}
                rows={3}
                value={
                  form.heroTitle
                }
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      heroTitle:
                        event.target.value,
                    })
                }
              />
            </label>

            <label>
              Description
              <textarea
                required
                maxLength={900}
                rows={5}
                value={
                  form.heroDescription
                }
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      heroDescription:
                        event.target.value,
                    })
                }
              />
            </label>

            <label>
              Citation
              <textarea
                required
                maxLength={320}
                rows={3}
                value={
                  form.quoteText
                }
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      quoteText:
                        event.target.value,
                    })
                }
              />
            </label>
          </div>

          <button
            type="submit"
            className="primary-button branding-save"
            disabled={busy}
          >
            {busy
              ? 'Enregistrement...'
              : 'Enregistrer les textes'}
          </button>
        </form>

        <div className="branding-media-column">
          <article className="panel branding-media-card">
            <div className="branding-panel-heading">
              <div>
                <h2>
                  Logo
                </h2>

                <p>
                  PNG, JPG ou WEBP · 5 Mo maximum.
                </p>
              </div>
            </div>

            <div className="branding-logo-preview">
              {branding?.logoUrl
                ? (
                  <img
                    src={
                      absoluteAsset(
                        branding.logoUrl,
                      )
                    }
                    alt="Logo actuel"
                  />
                )
                : (
                  <span>
                    Aucun logo
                  </span>
                )}
            </div>

            <label className="branding-upload-button">
              Changer le logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                onChange={
                  (event) =>
                    void upload(
                      'logo',
                      event,
                    )
                }
              />
            </label>
          </article>

          <article className="panel branding-media-card">
            <div className="branding-panel-heading">
              <div>
                <h2>
                  Image de l’établissement
                </h2>

                <p>
                  Visuel principal de la page de connexion · 8 Mo maximum.
                </p>
              </div>
            </div>

            <div className="branding-hero-preview">
              {branding?.heroImageUrl
                ? (
                  <img
                    src={
                      absoluteAsset(
                        branding.heroImageUrl,
                      )
                    }
                    alt="Visuel de connexion actuel"
                  />
                )
                : (
                  <span>
                    Aucun visuel
                  </span>
                )}
            </div>

            <label className="branding-upload-button">
              Changer l’image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                onChange={
                  (event) =>
                    void upload(
                      'hero',
                      event,
                    )
                }
              />
            </label>
          </article>
        </div>
      </section>

      <section className="panel branding-meta">
        <div>
          <span>
            Dernière modification
          </span>

          <strong>
            {branding?.updatedAt
              ? new Date(
                  branding.updatedAt,
                )
                  .toLocaleString(
                    'fr-FR',
                  )
              : '—'}
          </strong>
        </div>

        <div>
          <span>
            Modifié par
          </span>

          <strong>
            {branding?.updatedBy ??
              'Système'}
          </strong>
        </div>
      </section>
    </div>
  );
}
