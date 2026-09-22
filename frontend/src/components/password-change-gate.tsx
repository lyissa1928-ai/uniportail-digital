import {
  useEffect,
  useState,
} from 'react';

import type {
  FormEvent,
  ReactNode,
} from 'react';

import {
  api,
} from '../lib/api';

type CompteSecurite = {
  id: number;
  email: string;
  actif: boolean;
  doitChangerMotDePasse: boolean;
  dateChangementMotDePasse?: string | null;
  derniereConnexion?: string | null;
};

interface PasswordChangeGateProps {
  children: ReactNode;
}

export function PasswordChangeGate({
  children,
}: PasswordChangeGateProps) {
  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    obligatoire,
    setObligatoire,
  ] =
    useState(false);

  const [
    ancienMotDePasse,
    setAncienMotDePasse,
  ] =
    useState('');

  const [
    nouveauMotDePasse,
    setNouveauMotDePasse,
  ] =
    useState('');

  const [
    confirmation,
    setConfirmation,
  ] =
    useState('');

  const [
    erreur,
    setErreur,
  ] =
    useState('');

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  useEffect(
    () => {
      let actif = true;

      async function verifier() {
        try {
          const securite =
            await api<CompteSecurite>(
              '/compte/securite',
            );

          if (actif) {
            setObligatoire(
              securite
                .doitChangerMotDePasse ===
                true,
            );
          }
        }
        catch {
          /*
           * L'authentification globale
           * gère déjà les sessions invalides.
           */
        }
        finally {
          if (actif) {
            setLoading(false);
          }
        }
      }

      void verifier();

      return () => {
        actif = false;
      };
    },
    [],
  );

  async function changer(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErreur('');

    if (
      nouveauMotDePasse.length < 12
    ) {
      setErreur(
        'Le nouveau mot de passe doit contenir au moins 12 caractères.',
      );

      return;
    }

    if (
      nouveauMotDePasse !==
      confirmation
    ) {
      setErreur(
        'La confirmation du nouveau mot de passe est incorrecte.',
      );

      return;
    }

    if (
      ancienMotDePasse ===
      nouveauMotDePasse
    ) {
      setErreur(
        'Le nouveau mot de passe doit être différent du mot de passe temporaire.',
      );

      return;
    }

    setBusy(true);

    try {
      await api(
        '/compte/mot-de-passe',
        {
          method: 'PATCH',

          body:
            JSON.stringify({
              ancienMotDePasse,

              nouveauMotDePasse,

              confirmationMotDePasse:
                confirmation,
            }),
        },
      );

      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmation('');

      setObligatoire(false);

      /*
       * Recharge l'application pour
       * récupérer l'état utilisateur
       * le plus récent.
       */
      window.location.reload();
    }
    catch (error: unknown) {
      setErreur(
        error instanceof Error
          ? error.message
          : 'Modification du mot de passe impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        {children}
      </>
    );
  }

  if (!obligatoire) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background:
          'rgba(15, 23, 42, 0.82)',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 520,
          padding: 28,
          borderRadius: 16,
          background: '#ffffff',
          boxShadow:
            '0 25px 70px rgba(0,0,0,.3)',
        }}
      >
        <p
          style={{
            margin: '0 0 6px',
            fontSize: 12,
            fontWeight: 700,
            textTransform:
              'uppercase',
            letterSpacing:
              '.08em',
            color: '#64748b',
          }}
        >
          Sécurité du compte
        </p>

        <h1
          style={{
            margin:
              '0 0 10px',
            fontSize: 26,
          }}
        >
          Modifiez votre mot de passe
        </h1>

        <p
          style={{
            margin:
              '0 0 22px',
            color: '#64748b',
            lineHeight: 1.6,
          }}
        >
          Le mot de passe reçu lors de la création
          de votre compte est temporaire.
          Vous devez définir votre propre mot de passe
          avant d'accéder à la plateforme.
        </p>

        {erreur && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              borderRadius: 8,
              background:
                '#fef2f2',
              color:
                '#991b1b',
            }}
          >
            {erreur}
          </div>
        )}

        <form
          onSubmit={changer}
          style={{
            display: 'grid',
            gap: 16,
          }}
        >
          <label
            style={{
              display: 'grid',
              gap: 7,
              fontWeight: 600,
            }}
          >
            Mot de passe temporaire

            <input
              required
              type="password"
              autoComplete="current-password"
              value={
                ancienMotDePasse
              }
              onChange={
                (event) =>
                  setAncienMotDePasse(
                    event.target.value,
                  )
              }
              style={{
                minHeight: 44,
                padding:
                  '9px 11px',
                border:
                  '1px solid #cbd5e1',
                borderRadius: 8,
              }}
            />
          </label>

          <label
            style={{
              display: 'grid',
              gap: 7,
              fontWeight: 600,
            }}
          >
            Nouveau mot de passe

            <input
              required
              minLength={12}
              type="password"
              autoComplete="new-password"
              value={
                nouveauMotDePasse
              }
              onChange={
                (event) =>
                  setNouveauMotDePasse(
                    event.target.value,
                  )
              }
              style={{
                minHeight: 44,
                padding:
                  '9px 11px',
                border:
                  '1px solid #cbd5e1',
                borderRadius: 8,
              }}
            />
          </label>

          <label
            style={{
              display: 'grid',
              gap: 7,
              fontWeight: 600,
            }}
          >
            Confirmer le nouveau mot de passe

            <input
              required
              minLength={12}
              type="password"
              autoComplete="new-password"
              value={
                confirmation
              }
              onChange={
                (event) =>
                  setConfirmation(
                    event.target.value,
                  )
              }
              style={{
                minHeight: 44,
                padding:
                  '9px 11px',
                border:
                  '1px solid #cbd5e1',
                borderRadius: 8,
              }}
            />
          </label>

          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background:
                '#f8fafc',
              color:
                '#475569',
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            Utilisez au minimum 12 caractères.
            Évitez de réutiliser votre ancien mot de passe.
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              minHeight: 46,
              border: 0,
              borderRadius: 8,
              background:
                '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              cursor:
                busy
                  ? 'wait'
                  : 'pointer',
            }}
          >
            {busy
              ? 'Modification...'
              : 'Enregistrer mon nouveau mot de passe'}
          </button>
        </form>
      </section>
    </div>
  );
}