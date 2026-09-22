import {
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router';

import {
  ApiException,
} from '../lib/api';

import {
  useAuth,
} from '../auth/auth-context';

function Icon({
  children,
}: {
  children:
    ReactNode;
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

export function LoginPage() {
  const {
    login,
    authenticated,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    motDePasse,
    setMotDePasse,
  ] =
    useState('');

  const [
    afficherMotDePasse,
    setAfficherMotDePasse,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    erreur,
    setErreur,
  ] =
    useState('');

  if (authenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErreur('');
    setSubmitting(true);

    try {
      await login(
        email,
        motDePasse,
      );

      const destination =
        (
          location.state as
            | {
                from?: string;
              }
            | null
        )?.from ??
        '/dashboard';

      navigate(
        destination,
        {
          replace:
            true,
        },
      );
    }
    catch (error) {
      if (
        error instanceof
        ApiException
      ) {
        setErreur(
          error.message,
        );
      }
      else {
        setErreur(
          'Connexion impossible.',
        );
      }
    }
    finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-pro">
      <section className="login-pro-brand">
        <div className="login-pro-glow login-pro-glow-one" />
        <div className="login-pro-glow login-pro-glow-two" />
        <div className="login-pro-ring login-pro-ring-one" />
        <div className="login-pro-ring login-pro-ring-two" />

        <header className="login-pro-logo">
          <div className="login-pro-logo-mark">
            UP
          </div>

          <div>
            <strong>
              UniPortail Digital
            </strong>

            <span>
              Plateforme académique
            </span>
          </div>
        </header>

        <div className="login-pro-brand-content">
          <div className="login-pro-eyebrow">
            <span />

            Au service d’une université plus connectée
          </div>

          <h1>
            Pilotez les
            <br />
            enseignements,
            <br />
            la pédagogie et
            <br />
            <em>
              les diplômes
            </em>
          </h1>

          <p className="login-pro-intro">
            Une plateforme unique pour simplifier
            la gestion académique, assurer le suivi
            pédagogique, la scolarité et la délivrance
            des diplômes, en toute sécurité.
          </p>

          <div className="login-pro-feature-grid">
            <article>
              <span className="login-pro-feature-icon">
                <Icon>
                  <path d="m3 9 9-5 9 5-9 5z" />
                  <path d="M7 12v4c3 2 7 2 10 0v-4" />
                </Icon>
              </span>

              <div>
                <strong>
                  Suivi pédagogique
                </strong>

                <p>
                  Suivez les parcours et les évaluations
                  en temps réel.
                </p>
              </div>
            </article>

            <article>
              <span className="login-pro-feature-icon">
                <Icon>
                  <circle cx="8" cy="8" r="3" />
                  <circle cx="17" cy="9" r="2.5" />
                  <path d="M2.5 20v-1.5A5.5 5.5 0 0 1 8 13a5.5 5.5 0 0 1 5.5 5.5V20" />
                  <path d="M14 14a4.5 4.5 0 0 1 7.5 3.5V20" />
                </Icon>
              </span>

              <div>
                <strong>
                  Scolarité
                </strong>

                <p>
                  Gérez les inscriptions, les parcours
                  et les étudiants.
                </p>
              </div>
            </article>

            <article>
              <span className="login-pro-feature-icon">
                <Icon>
                  <circle cx="12" cy="9" r="5" />
                  <path d="m9 13-1 8 4-2 4 2-1-8" />
                </Icon>
              </span>

              <div>
                <strong>
                  Diplômes
                </strong>

                <p>
                  Contrôlez l’éligibilité et la délivrance
                  des diplômes.
                </p>
              </div>
            </article>

            <article>
              <span className="login-pro-feature-icon">
                <Icon>
                  <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6z" />
                  <path d="m8.5 12 2.2 2.2 4.8-5" />
                </Icon>
              </span>

              <div>
                <strong>
                  Accès sécurisé
                </strong>

                <p>
                  Des données protégées pour une
                  confiance durable.
                </p>
              </div>
            </article>
          </div>

          <div className="login-pro-mantra">
            Enseigner
            <span>·</span>
            Accompagner
            <span>·</span>
            Certifier
            <span>·</span>
            Bâtir demain
          </div>
        </div>
      </section>

      <section className="login-pro-access">
        <div className="login-pro-language">
          FR
          <span>⌄</span>
        </div>

        <div className="login-pro-card">
          <div className="login-pro-lock">
            <Icon>
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </Icon>
          </div>

          <div className="login-pro-title">
            <h2>
              Connexion
            </h2>

            <p>
              Accédez à votre espace institutionnel
              UniPortail Digital en toute sécurité.
            </p>
          </div>

          {erreur && (
            <div className="alert error">
              {erreur}
            </div>
          )}

          <form
            className="login-pro-form"
            onSubmit={submit}
          >
            <label>
              Adresse e-mail

              <div className="login-pro-input">
                <span>
                  <Icon>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m4 7 8 6 8-6" />
                  </Icon>
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={
                    (event) =>
                      setEmail(
                        event.target
                          .value,
                      )
                  }
                  required
                  autoComplete="username"
                  placeholder="nom@domaine.sn"
                />
              </div>
            </label>

            <label>
              Mot de passe

              <div className="login-pro-input">
                <span>
                  <Icon>
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </Icon>
                </span>

                <input
                  type={
                    afficherMotDePasse
                      ? 'text'
                      : 'password'
                  }
                  value={motDePasse}
                  onChange={
                    (event) =>
                      setMotDePasse(
                        event.target
                          .value,
                      )
                  }
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-pro-eye"
                  aria-label={
                    afficherMotDePasse
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                  onClick={
                    () =>
                      setAfficherMotDePasse(
                        (value) =>
                          !value,
                      )
                  }
                >
                  <Icon>
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </Icon>
                </button>
              </div>
            </label>

            <div className="login-pro-options">
              <label className="login-pro-remember">
                <input
                  type="checkbox"
                />

                <span>
                  Se souvenir de moi
                </span>
              </label>

              <span className="login-pro-forgot">
                Mot de passe oublié ?
              </span>
            </div>

            <button
              className="login-pro-submit"
              disabled={submitting}
              type="submit"
            >
              <span>
                {submitting
                  ? 'Connexion...'
                  : 'Se connecter'}
              </span>

              {!submitting && (
                <Icon>
                  <path d="M5 12h14M14 7l5 5-5 5" />
                </Icon>
              )}
            </button>
          </form>

          <div className="login-pro-divider">
            <span />

            <small>
              Sécurité
            </small>

            <span />
          </div>

          <div className="login-pro-secure-box">
            <span>
              <Icon>
                <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6z" />
                <path d="m8.5 12 2.2 2.2 4.8-5" />
              </Icon>
            </span>

            <div>
              <strong>
                Connexion sécurisée
              </strong>

              <p>
                Vos données sont protégées et confidentielles.
              </p>
            </div>
          </div>
        </div>

        <footer className="login-pro-footer">
          <span>
            © 2026 UniPortail Digital. Tous droits réservés.
          </span>

          <div>
            <span>
              Aide
            </span>

            <span>
              Contact
            </span>

            <span>
              Mentions légales
            </span>
          </div>
        </footer>
      </section>
    </main>
  );
}
