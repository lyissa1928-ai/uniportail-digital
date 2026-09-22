import {
  useEffect,
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import {
  api,
} from '../lib/api';

type Role = {
  id?: number;
  code: string;
  nom?: string;
};

type Etudiant = {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
};

type Enseignant = {
  id: number;
  matricule?: string;
  nom: string;
  prenom: string;
};

function unwrap<T>(
  value: T[] | {
    data?: T[];
  },
): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value &&
    Array.isArray(value.data)
  ) {
    return value.data;
  }

  return [];
}

export function AjouterUtilisateurPanel() {
  const [
    ouvert,
    setOuvert,
  ] = useState(false);

  const [
    roles,
    setRoles,
  ] = useState<Role[]>([]);

  const [
    etudiants,
    setEtudiants,
  ] = useState<Etudiant[]>([]);

  const [
    enseignants,
    setEnseignants,
  ] = useState<Enseignant[]>([]);

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    erreur,
    setErreur,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    afficherMotDePasse,
    setAfficherMotDePasse,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState({
    nomAffichage: '',
    email: '',
    motDePasse: '',
    role: '',
    etudiantId: '',
    enseignantId: '',
  });

  useEffect(
    () => {
      async function charger() {
        try {
          const roleResult =
            await api<Role[]>(
              '/utilisateurs/roles',
            );

          const roleList =
            unwrap<Role>(
              roleResult,
            );

          setRoles(
            roleList,
          );

          if (
            roleList.length > 0
          ) {
            setForm(
              (current) => ({
                ...current,
                role:
                  current.role ||
                  roleList[0].code,
              }),
            );
          }

          try {
            const result =
              await api<Etudiant[]>(
                '/etudiants',
              );

            setEtudiants(
              unwrap<Etudiant>(
                result,
              ),
            );
          }
          catch {
            setEtudiants([]);
          }

          try {
            const result =
              await api<Enseignant[]>(
                '/enseignants',
              );

            setEnseignants(
              unwrap<Enseignant>(
                result,
              ),
            );
          }
          catch {
            setEnseignants([]);
          }
        }
        catch (error: unknown) {
          setErreur(
            error instanceof Error
              ? error.message
              : 'Chargement des rôles impossible.',
          );
        }
      }

      void charger();
    },
    [],
  );

  async function creer(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErreur('');
    setMessage('');

    if (
      form.motDePasse.length < 12
    ) {
      setErreur(
        'Le mot de passe initial doit contenir au moins 12 caractères.',
      );

      return;
    }

    if (
      form.role === 'ETUDIANT' &&
      !form.etudiantId
    ) {
      setErreur(
        'Sélectionnez l’étudiant associé.',
      );

      return;
    }

    if (
      form.role === 'ENSEIGNANT' &&
      !form.enseignantId
    ) {
      setErreur(
        'Sélectionnez l’enseignant associé.',
      );

      return;
    }

    const body: {
      email: string;
      motDePasse: string;
      nomAffichage?: string;
      roles: string[];
      etudiantId?: number;
      enseignantId?: number;
    } = {
      email:
        form.email.trim(),

      motDePasse:
        form.motDePasse,

      roles: [
        form.role,
      ],
    };

    if (
      form.nomAffichage.trim()
    ) {
      body.nomAffichage =
        form.nomAffichage.trim();
    }

    if (
      form.role === 'ETUDIANT'
    ) {
      body.etudiantId =
        Number(
          form.etudiantId,
        );
    }

    if (
      form.role === 'ENSEIGNANT'
    ) {
      body.enseignantId =
        Number(
          form.enseignantId,
        );
    }

    setBusy(true);

    try {
      await api(
        '/utilisateurs',
        {
          method: 'POST',

          body:
            JSON.stringify(
              body,
            ),
        },
      );

      setMessage(
        'Utilisateur créé avec succès.',
      );

      setForm(
        (current) => ({
          ...current,
          nomAffichage: '',
          email: '',
          motDePasse: '',
          etudiantId: '',
          enseignantId: '',
        }),
      );

      setTimeout(
        () => {
          window.location.reload();
        },
        700,
      );
    }
    catch (error: unknown) {
      setErreur(
        error instanceof Error
          ? error.message
          : 'Création impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="card"
      style={{
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Gestion des utilisateurs
          </h2>

          <p>
            Créez les comptes et attribuez
            les profils d’accès à la plateforme.
          </p>
        </div>

        <button
          type="button"
          onClick={
            () =>
              setOuvert(
                (value) =>
                  !value,
              )
          }
        >
          {ouvert
            ? 'Fermer'
            : '+ Ajouter un utilisateur'}
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 8,
            background:
              '#f0fdf4',
            color:
              '#166534',
          }}
        >
          {message}
        </div>
      )}

      {erreur && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
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

      {ouvert && (
        <form
          onSubmit={creer}
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginTop: 22,
            paddingTop: 22,
            borderTop:
              '1px solid #e2e8f0',
          }}
        >
          <label>
            Nom affiché

            <input
              value={
                form.nomAffichage
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    nomAffichage:
                      event.target.value,
                  })
              }
            />
          </label>

          <label>
            Adresse e-mail

            <input
              required
              type="email"
              value={
                form.email
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    email:
                      event.target.value,
                  })
              }
            />
          </label>

          <label>
            Profil

            <select
              required
              value={
                form.role
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    role:
                      event.target.value,
                    etudiantId: '',
                    enseignantId: '',
                  })
              }
            >
              <option value="">
                Sélectionner
              </option>

              {roles.map(
                (role) => (
                  <option
                    key={
                      role.code
                    }
                    value={
                      role.code
                    }
                  >
                    {role.nom ??
                      role.code}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Mot de passe initial

            <div
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              <input
                required
                minLength={12}
                type={
                  afficherMotDePasse
                    ? 'text'
                    : 'password'
                }
                value={
                  form.motDePasse
                }
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      motDePasse:
                        event.target.value,
                    })
                }
                style={{
                  flex: 1,
                }}
              />

              <button
                type="button"
                onClick={
                  () =>
                    setAfficherMotDePasse(
                      (value) =>
                        !value,
                    )
                }
              >
                {afficherMotDePasse
                  ? 'Masquer'
                  : 'Voir'}
              </button>
            </div>
          </label>

          {form.role ===
            'ETUDIANT' && (
            <label>
              Étudiant associé

              <select
                required
                value={
                  form.etudiantId
                }
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      etudiantId:
                        event.target.value,
                    })
                }
              >
                <option value="">
                  Sélectionner un étudiant
                </option>

                {etudiants.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.matricule}
                      {' — '}
                      {item.prenom}
                      {' '}
                      {item.nom}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}

          {form.role ===
            'ENSEIGNANT' && (
            <label>
              Enseignant associé

              <select
                required
                value={
                  form.enseignantId
                }
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      enseignantId:
                        event.target.value,
                    })
                }
              >
                <option value="">
                  Sélectionner un enseignant
                </option>

                {enseignants.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.matricule ??
                        item.id}
                      {' — '}
                      {item.prenom}
                      {' '}
                      {item.nom}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}

          <div
            style={{
              gridColumn:
                '1 / -1',
              display: 'flex',
              justifyContent:
                'flex-end',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={
                () =>
                  setOuvert(false)
              }
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={busy}
            >
              {busy
                ? 'Création...'
                : 'Créer le compte'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}