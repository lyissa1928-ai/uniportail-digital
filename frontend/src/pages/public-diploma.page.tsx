import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import {
  Link,
} from 'react-router';

import {
  api,
  ApiException,
} from '../lib/api';

import './public-diploma.page.css';

type PublicBranding = {
  appName: string;
  appSubtitle: string;
  logoUrl: string;
};

type Dossier = {
  inscriptionId: number;
  anneeAcademique: string;
  formation: string;
  niveau: string;
  statut: string;
  disponible: boolean;
  retire: boolean;
  peutDemander: boolean;
  numeroDiplome?: string | null;
  dateDisponibilite?: string | null;
  dateRetrait?: string | null;
};

type LookupResponse = {
  matricule: string;
  dossiers: Dossier[];
  emailEnvoye?: boolean;
};

type ExternalCreated = {
  reference: string;
  statut: string;
  emailEnvoye: boolean;
};

type ExternalTracking = {
  reference: string;
  typeDemande: string;
  statut: string;
  intituleDiplome: string;
  anneeObtention: number;
  dateDisponibilite?: string | null;
  motif?: string | null;
  createdAt: string;
};

function Icon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '—';
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

export function PublicDiplomaPage() {
  const [
    branding,
    setBranding,
  ] =
    useState<PublicBranding>({
      appName:
        'UniPortail Digital',
      appSubtitle:
        'Suivi & Évaluation Académique',
      logoUrl:
        '/images/uniportail-logo.webp',
    });

  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    matricule,
    setMatricule,
  ] =
    useState('');

  const [
    result,
    setResult,
  ] =
    useState<LookupResponse | null>(
      null,
    );

  const [
    showExternal,
    setShowExternal,
  ] =
    useState(false);

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
    notice,
    setNotice,
  ] =
    useState('');

  const [
    externalReference,
    setExternalReference,
  ] =
    useState('');

  const [
    tracking,
    setTracking,
  ] =
    useState<ExternalTracking | null>(
      null,
    );

  const [
    externalForm,
    setExternalForm,
  ] =
    useState({
      nom:
        '',
      prenom:
        '',
      dateNaissance:
        '',
      anneeObtention:
        String(
          new Date()
            .getFullYear(),
        ),
      intituleDiplome:
        '',
      typeDemande:
        'PREMIERE_DEMANDE',
    });

  useEffect(
    () => {
      let mounted =
        true;

      void api<PublicBranding>(
        '/branding/public',
      )
        .then(
          (value) => {
            if (mounted) {
              setBranding(
                value,
              );
            }
          },
        )
        .catch(
          () =>
            undefined,
        );

      return () => {
        mounted =
          false;
      };
    },
    [],
  );

  function fail(
    currentError:
      unknown,
    fallback:
      string,
  ) {
    setError(
      currentError instanceof
        ApiException
        ? currentError.message
        : fallback,
    );
  }

  async function verify(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setBusy(true);
    setError('');
    setNotice('');
    setResult(null);
    setShowExternal(false);

    try {
      const response =
        await api<LookupResponse>(
          '/diplomes/public/verifier',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                email:
                  email.trim(),
                matricule:
                  matricule
                    .trim(),
              }),
          },
        );

      setResult(
        response,
      );
    }
    catch (currentError) {
      if (
        currentError instanceof
          ApiException &&
        currentError.status ===
          404
      ) {
        setShowExternal(
          true,
        );

        setNotice(
          'Aucun dossier n’a été retrouvé avec cette adresse e-mail et ce matricule. Vous pouvez déposer une demande manuelle ci-dessous.',
        );
      }
      else {
        fail(
          currentError,
          'Vérification impossible.',
        );
      }
    }
    finally {
      setBusy(false);
    }
  }

  async function requestKnown(
    inscriptionId:
      number,
  ) {
    setBusy(true);
    setError('');
    setNotice('');

    try {
      const response =
        await api<LookupResponse>(
          '/diplomes/public/demander',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                email:
                  email.trim(),
                matricule:
                  matricule
                    .trim(),
                inscriptionId,
              }),
          },
        );

      setResult(
        response,
      );

      setNotice(
        response.emailEnvoye
          ? 'Votre demande est enregistrée. Un e-mail de confirmation vous a été envoyé.'
          : 'Votre demande est enregistrée. L’e-mail de confirmation n’a pas pu être envoyé pour le moment.',
      );
    }
    catch (currentError) {
      fail(
        currentError,
        'Demande impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function submitExternal(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const created =
        await api<ExternalCreated>(
          '/diplomes/public/demander-externe',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                email:
                  email.trim(),
                matricule:
                  matricule.trim() ||
                  undefined,
                nom:
                  externalForm
                    .nom
                    .trim(),
                prenom:
                  externalForm
                    .prenom
                    .trim(),
                dateNaissance:
                  externalForm
                    .dateNaissance,
                anneeObtention:
                  Number(
                    externalForm
                      .anneeObtention,
                  ),
                intituleDiplome:
                  externalForm
                    .intituleDiplome
                    .trim(),
                typeDemande:
                  externalForm
                    .typeDemande,
              }),
          },
        );

      setExternalReference(
        created.reference,
      );

      setNotice(
        created.emailEnvoye
          ? 'Demande enregistrée. Un e-mail de confirmation contenant votre référence a été envoyé.'
          : 'Demande enregistrée. Conservez la référence affichée : l’e-mail de confirmation n’a pas pu être envoyé pour le moment.',
      );
    }
    catch (currentError) {
      fail(
        currentError,
        'Enregistrement de la demande impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function track(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setBusy(true);
    setError('');
    setTracking(null);

    try {
      const response =
        await api<ExternalTracking>(
          '/diplomes/public/suivre-externe',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                email:
                  email.trim(),
                reference:
                  externalReference
                    .trim(),
              }),
          },
        );

      setTracking(
        response,
      );
    }
    catch (currentError) {
      fail(
        currentError,
        'Suivi de la demande impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  return (
    <main className="public-diploma-page">
      <header className="public-diploma-nav">
        <Link
          to="/"
          className="public-diploma-brand"
        >
          <img
            src={
              branding.logoUrl
            }
            alt={
              branding.appName
            }
          />
        </Link>

        <div className="public-diploma-nav-actions">
          <Link
            to="/"
            className="public-diploma-back"
          >
            <Icon>
              <path d="M19 12H5" />
              <path d="m10 17-5-5 5-5" />
            </Icon>

            Retour à l’accueil
          </Link>

          <Link
            to="/login"
            className="public-diploma-login"
          >
            Se connecter
          </Link>
        </div>
      </header>

      <section className="public-diploma-hero">
        <div>
          <span>
            Service public
          </span>

          <h1>
            Demande et suivi
            <br />
            de diplôme
          </h1>

          <p>
            Vérifiez d’abord votre dossier avec votre matricule et votre adresse e-mail. Si aucune information n’est retrouvée, un formulaire de demande manuelle vous sera proposé.
          </p>
        </div>

        <div className="public-diploma-hero-card">
          <Icon>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8M8 17h5" />
          </Icon>

          <strong>
            Diplôme ou duplicata
          </strong>

          <span>
            Suivi sécurisé par référence
          </span>
        </div>
      </section>

      <section className="public-diploma-content">
        <article className="public-diploma-panel">
          <div className="public-diploma-panel-head">
            <span>
              Étape 1
            </span>

            <h2>
              Rechercher mon dossier
            </h2>

            <p>
              Les deux informations doivent correspondre au dossier étudiant enregistré.
            </p>
          </div>

          <form
            className="public-diploma-form"
            onSubmit={
              verify
            }
          >
            <label>
              Matricule
              <input
                required
                maxLength={80}
                value={
                  matricule
                }
                onChange={
                  (event) =>
                    setMatricule(
                      event.target
                        .value,
                    )
                }
                placeholder="Votre matricule"
              />
            </label>

            <label>
              Adresse e-mail
              <input
                required
                type="email"
                maxLength={180}
                value={
                  email
                }
                onChange={
                  (event) =>
                    setEmail(
                      event.target
                        .value,
                    )
                }
                placeholder="nom@domaine.com"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
            >
              {busy
                ? 'Vérification...'
                : 'Vérifier mon dossier'}
            </button>
          </form>
        </article>

        {notice && (
          <div className="public-diploma-message info">
            {notice}
          </div>
        )}

        {error && (
          <div className="public-diploma-message error">
            {error}
          </div>
        )}

        {result && (
          <article className="public-diploma-panel">
            <div className="public-diploma-panel-head">
              <span>
                Dossier retrouvé
              </span>

              <h2>
                Mes diplômes
              </h2>
            </div>

            <div className="public-diploma-dossiers">
              {result.dossiers.length ===
              0 ? (
                <div className="public-diploma-empty">
                  Aucun parcours terminal n’est actuellement associé à ce dossier.
                </div>
              ) : (
                result.dossiers.map(
                  (item) => (
                    <article
                      key={
                        item.inscriptionId
                      }
                      className="public-diploma-dossier"
                    >
                      <div>
                        <span className="public-diploma-year">
                          {item.anneeAcademique}
                        </span>

                        <h3>
                          {item.formation}
                        </h3>

                        <p>
                          {item.niveau}
                        </p>
                      </div>

                      <div className="public-diploma-status-block">
                        <strong>
                          {item.statut.replaceAll(
                            '_',
                            ' ',
                          )}
                        </strong>

                        {item.disponible && (
                          <span className="available">
                            Disponible
                          </span>
                        )}

                        {item.numeroDiplome && (
                          <small>
                            N° {item.numeroDiplome}
                          </small>
                        )}

                        {item.peutDemander && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={
                              () =>
                                void requestKnown(
                                  item.inscriptionId,
                                )
                            }
                          >
                            Demander ce diplôme
                          </button>
                        )}
                      </div>
                    </article>
                  ),
                )
              )}
            </div>
          </article>
        )}

        {showExternal && (
          <article className="public-diploma-panel external">
            <div className="public-diploma-panel-head">
              <span>
                Dossier non retrouvé
              </span>

              <h2>
                Déposer une demande manuelle
              </h2>

              <p>
                Le service des diplômes vérifiera les informations avant toute mise à disposition.
              </p>
            </div>

            <form
              className="public-diploma-form external-grid"
              onSubmit={
                submitExternal
              }
            >
              <label>
                Type de demande
                <select
                  value={
                    externalForm
                      .typeDemande
                  }
                  onChange={
                    (event) =>
                      setExternalForm({
                        ...externalForm,
                        typeDemande:
                          event.target
                            .value,
                      })
                  }
                >
                  <option value="PREMIERE_DEMANDE">
                    Demande de diplôme
                  </option>

                  <option value="DUPLICATA">
                    Duplicata de diplôme
                  </option>
                </select>
              </label>

              <label>
                Adresse e-mail
                <input
                  required
                  type="email"
                  value={
                    email
                  }
                  onChange={
                    (event) =>
                      setEmail(
                        event.target
                          .value,
                      )
                  }
                />
              </label>

              <label>
                Nom
                <input
                  required
                  maxLength={100}
                  value={
                    externalForm
                      .nom
                  }
                  onChange={
                    (event) =>
                      setExternalForm({
                        ...externalForm,
                        nom:
                          event.target
                            .value,
                      })
                  }
                />
              </label>

              <label>
                Prénom
                <input
                  required
                  maxLength={120}
                  value={
                    externalForm
                      .prenom
                  }
                  onChange={
                    (event) =>
                      setExternalForm({
                        ...externalForm,
                        prenom:
                          event.target
                            .value,
                      })
                  }
                />
              </label>

              <label>
                Date de naissance
                <input
                  required
                  type="date"
                  value={
                    externalForm
                      .dateNaissance
                  }
                  onChange={
                    (event) =>
                      setExternalForm({
                        ...externalForm,
                        dateNaissance:
                          event.target
                            .value,
                      })
                  }
                />
              </label>

              <label>
                Année d’obtention
                <input
                  required
                  type="number"
                  min={1950}
                  max={2100}
                  value={
                    externalForm
                      .anneeObtention
                  }
                  onChange={
                    (event) =>
                      setExternalForm({
                        ...externalForm,
                        anneeObtention:
                          event.target
                            .value,
                      })
                  }
                />
              </label>

              <label className="wide">
                Diplôme / formation concernée
                <input
                  required
                  maxLength={220}
                  value={
                    externalForm
                      .intituleDiplome
                  }
                  onChange={
                    (event) =>
                      setExternalForm({
                        ...externalForm,
                        intituleDiplome:
                          event.target
                            .value,
                      })
                  }
                  placeholder="Ex. Licence Réseaux et Télécommunications"
                />
              </label>

              <div className="public-diploma-confirmation wide">
                Le matricule recherché <strong>{matricule}</strong> sera joint à votre demande pour faciliter la vérification.
              </div>

              <button
                type="submit"
                className="wide"
                disabled={busy}
              >
                {busy
                  ? 'Enregistrement...'
                  : 'Envoyer ma demande'}
              </button>
            </form>
          </article>
        )}

        {externalReference && (
          <article className="public-diploma-panel tracking">
            <div className="public-diploma-panel-head">
              <span>
                Référence
              </span>

              <h2>
                {externalReference}
              </h2>

              <p>
                Conservez cette référence pour suivre votre demande.
              </p>
            </div>

            <form
              className="public-diploma-track-form"
              onSubmit={
                track
              }
            >
              <input
                required
                value={
                  externalReference
                }
                onChange={
                  (event) =>
                    setExternalReference(
                      event.target
                        .value,
                    )
                }
              />

              <button
                type="submit"
                disabled={busy}
              >
                Suivre la demande
              </button>
            </form>

            {tracking && (
              <div className="public-diploma-tracking-result">
                <div>
                  <span>
                    Statut
                  </span>

                  <strong>
                    {tracking.statut.replaceAll(
                      '_',
                      ' ',
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Diplôme
                  </span>

                  <strong>
                    {tracking.intituleDiplome}
                  </strong>
                </div>

                <div>
                  <span>
                    Année
                  </span>

                  <strong>
                    {tracking.anneeObtention}
                  </strong>
                </div>

                <div>
                  <span>
                    Disponibilité
                  </span>

                  <strong>
                    {formatDate(
                      tracking.dateDisponibilite,
                    )}
                  </strong>
                </div>
              </div>
            )}
          </article>
        )}
      </section>

      <footer className="public-diploma-footer">
        <span>
          © 2026 {branding.appName}
        </span>

        <span>
          {branding.appSubtitle}
        </span>
      </footer>
    </main>
  );
}
