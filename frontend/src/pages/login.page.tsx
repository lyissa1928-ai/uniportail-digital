import {
  useState,
  type FormEvent,
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
          replace: true,
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
    <main className="login-page">
      <section className="login-brand">
        <div>
          <span className="eyebrow">
            Plateforme académique
          </span>

          <h1>
            Suivi des enseignements
            et gestion des diplômes
          </h1>

          <p>
            Suivi pédagogique,
            contrôle QHSE,
            scolarité, éligibilité
            et délivrance des
            diplômes dans une
            interface unique.
          </p>
        </div>
      </section>

      <section className="login-panel">
        <form
          className="login-card"
          onSubmit={submit}
        >
          <div>
            <span className="eyebrow">
              Accès sécurisé
            </span>

            <h2>
              Connexion
            </h2>

            <p className="muted">
              Utilisez votre compte
              institutionnel.
            </p>
          </div>

          {erreur && (
            <div
              className="alert error"
            >
              {erreur}
            </div>
          )}

          <label>
            Adresse e-mail

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
          </label>

          <label>
            Mot de passe

            <input
              type="password"
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
          </label>

          <button
            className="primary-button"
            disabled={submitting}
          >
            {submitting
              ? 'Connexion...'
              : 'Se connecter'}
          </button>
        </form>
      </section>
    </main>
  );
}
