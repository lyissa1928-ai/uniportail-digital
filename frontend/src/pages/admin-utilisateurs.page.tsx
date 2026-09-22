import {
  useEffect,
  useMemo,
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
  actif?: boolean;
};

type UserRole = {
  role?: Role;
  code?: string;
  nom?: string;
};

type Utilisateur = {
  id: number;
  email: string;
  nomAffichage?: string | null;
  actif: boolean;
  derniereConnexion?: string | null;
  etudiant?: {
    id: number;
    matricule?: string;
    nom?: string;
    prenom?: string;
  } | null;
  enseignant?: {
    id: number;
    matricule?: string;
    nom?: string;
    prenom?: string;
  } | null;
  roles?: UserRole[];
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
    Array.isArray(
      value.data,
    )
  ) {
    return value.data;
  }

  return [];
}

function roleCodes(
  user: Utilisateur,
): string[] {
  return (
    user.roles ?? []
  )
    .map(
      (item) =>
        item.role?.code ??
        item.code ??
        '',
    )
    .filter(Boolean);
}

export function AdminUtilisateursPage() {
  const [
    utilisateurs,
    setUtilisateurs,
  ] =
    useState<Utilisateur[]>([]);

  const [
    roles,
    setRoles,
  ] =
    useState<Role[]>([]);

  const [
    etudiants,
    setEtudiants,
  ] =
    useState<Etudiant[]>([]);

  const [
    enseignants,
    setEnseignants,
  ] =
    useState<Enseignant[]>([]);

  const [
    recherche,
    setRecherche,
  ] =
    useState('');

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
    erreur,
    setErreur,
  ] =
    useState('');

  const [
    message,
    setMessage,
  ] =
    useState('');

  const [
    selectedRoleByUser,
    setSelectedRoleByUser,
  ] =
    useState<Record<number, string>>(
      {},
    );

  const [
    form,
    setForm,
  ] =
    useState({
      nomAffichage: '',
      email: '',
      motDePasse: '',
      role: '',
      etudiantId: '',
      enseignantId: '',
    });

  async function charger() {
    setLoading(true);
    setErreur('');

    try {
      const [
        usersResult,
        rolesResult,
        etudiantsResult,
        enseignantsResult,
      ] =
        await Promise.allSettled([
          api<Utilisateur[]>(
            '/utilisateurs',
          ),

          api<Role[]>(
            '/utilisateurs/roles',
          ),

          api<Etudiant[]>(
            '/etudiants',
          ),

          api<Enseignant[]>(
            '/enseignants',
          ),
        ]);

      if (
        usersResult.status !==
        'fulfilled'
      ) {
        throw usersResult.reason;
      }

      if (
        rolesResult.status !==
        'fulfilled'
      ) {
        throw rolesResult.reason;
      }

      setUtilisateurs(
        unwrap(
          usersResult.value,
        ),
      );

      const roleList =
        unwrap(
          rolesResult.value,
        );

      setRoles(
        roleList,
      );

      if (
        !form.role &&
        roleList.length > 0
      ) {
        setForm(
          (current) => ({
            ...current,
            role:
              roleList[0].code,
          }),
        );
      }

      if (
        etudiantsResult.status ===
        'fulfilled'
      ) {
        setEtudiants(
          unwrap(
            etudiantsResult.value,
          ),
        );
      }

      if (
        enseignantsResult.status ===
        'fulfilled'
      ) {
        setEnseignants(
          unwrap(
            enseignantsResult.value,
          ),
        );
      }
    }
    catch (error: unknown) {
      setErreur(
        error instanceof Error
          ? error.message
          : 'Chargement impossible.',
      );
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(
    () => {
      void charger();
    },
    [],
  );

  const resultat =
    useMemo(
      () => {
        const search =
          recherche
            .trim()
            .toLowerCase();

        if (!search) {
          return utilisateurs;
        }

        return utilisateurs.filter(
          (user) =>
            [
              user.email,
              user.nomAffichage ?? '',
              roleCodes(user)
                .join(' '),
              user.etudiant
                ?.matricule ?? '',
              user.enseignant
                ?.matricule ?? '',
            ]
              .join(' ')
              .toLowerCase()
              .includes(
                search,
              ),
        );
      },
      [
        utilisateurs,
        recherche,
      ],
    );

  async function creer(
    event:
      FormEvent<HTMLFormElement>,
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
        'Sélectionnez la fiche étudiant à associer au compte.',
      );

      return;
    }

    if (
      form.role === 'ENSEIGNANT' &&
      !form.enseignantId
    ) {
      setErreur(
        'Sélectionnez la fiche enseignant à associer au compte.',
      );

      return;
    }

    setBusy(true);

    try {
      const body: Record<
        string,
        unknown
      > = {
        email:
          form.email
            .trim(),

        motDePasse:
          form.motDePasse,

        nomAffichage:
          form.nomAffichage
            .trim() ||
          undefined,

        roles: [
          form.role,
        ],
      };

      if (
        form.role ===
        'ETUDIANT'
      ) {
        body.etudiantId =
          Number(
            form.etudiantId,
          );
      }

      if (
        form.role ===
        'ENSEIGNANT'
      ) {
        body.enseignantId =
          Number(
            form.enseignantId,
          );
      }

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

      await charger();
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

  async function changerEtat(
    user: Utilisateur,
  ) {
    if (
      !window.confirm(
        user.actif
          ? `Désactiver ${user.email} ?`
          : `Activer ${user.email} ?`,
      )
    ) {
      return;
    }

    setErreur('');
    setMessage('');
    setBusy(true);

    try {
      await api(
        `/utilisateurs/${user.id}/${user.actif ? 'desactiver' : 'activer'}`,
        {
          method: 'PATCH',
        },
      );

      setMessage(
        user.actif
          ? 'Utilisateur désactivé.'
          : 'Utilisateur activé.',
      );

      await charger();
    }
    catch (error: unknown) {
      setErreur(
        error instanceof Error
          ? error.message
          : 'Modification impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function ajouterRole(
    user: Utilisateur,
  ) {
    const roleCode =
      selectedRoleByUser[
        user.id
      ];

    if (!roleCode) {
      setErreur(
        'Sélectionnez un rôle.',
      );

      return;
    }

    setBusy(true);
    setErreur('');
    setMessage('');

    try {
      await api(
        `/utilisateurs/${user.id}/roles`,
        {
          method: 'POST',

          body:
            JSON.stringify({
              roleCode,
            }),
        },
      );

      setMessage(
        'Rôle ajouté.',
      );

      await charger();
    }
    catch (error: unknown) {
      setErreur(
        error instanceof Error
          ? error.message
          : 'Ajout du rôle impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function retirerRole(
    user: Utilisateur,
    roleCode: string,
  ) {
    if (
      !window.confirm(
        `Retirer le rôle ${roleCode} à ${user.email} ?`,
      )
    ) {
      return;
    }

    setBusy(true);
    setErreur('');
    setMessage('');

    try {
      await api(
        `/utilisateurs/${user.id}/roles/${encodeURIComponent(roleCode)}`,
        {
          method: 'DELETE',
        },
      );

      setMessage(
        'Rôle retiré.',
      );

      await charger();
    }
    catch (error: unknown) {
      setErreur(
        error instanceof Error
          ? error.message
          : 'Retrait du rôle impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function synchroniser() {
    if (
      !window.confirm(
        'Synchroniser la matrice des rôles et permissions ?',
      )
    ) {
      return;
    }

    setBusy(true);
    setErreur('');
    setMessage('');

    try {
      await api(
        '/utilisateurs/securite/synchroniser',
        {
          method: 'POST',
        },
      );

      setMessage(
        'Rôles et permissions synchronisés. Reconnectez les comptes ADMIN déjà ouverts.',
      );

      await charger();
    }
    catch (error: unknown) {
      setErreur(
        error instanceof Error
          ? error.message
          : 'Synchronisation impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        display: 'grid',
        gap: 24,
      }}
    >
      <header
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
          <p>
            Administration
          </p>

          <h1>
            Gestion des utilisateurs
          </h1>

          <p>
            Création des comptes,
            attribution des rôles et
            gestion des accès.
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={
            synchroniser
          }
        >
          Synchroniser les droits
        </button>
      </header>

      {erreur && (
        <div
          style={{
            padding: 14,
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

      {message && (
        <div
          style={{
            padding: 14,
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

      <section className="card">
        <h2>
          Ajouter un utilisateur
        </h2>

        <form
          onSubmit={creer}
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 14,
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
            E-mail
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
            Mot de passe initial
            <input
              required
              type="password"
              minLength={12}
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
            />
          </label>

          <label>
            Rôle
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
                  Sélectionner
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
                  form
                    .enseignantId
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
                  Sélectionner
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

          <div>
            <button
              type="submit"
              disabled={busy}
            >
              {busy
                ? 'Création...'
                : 'Ajouter utilisateur'}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: 16,
            flexWrap:
              'wrap',
          }}
        >
          <div>
            <h2>
              Utilisateurs
            </h2>

            <p>
              {resultat.length}
              {' compte(s)'}
            </p>
          </div>

          <input
            placeholder="Rechercher..."
            value={
              recherche
            }
            onChange={
              (event) =>
                setRecherche(
                  event.target.value,
                )
            }
          />
        </div>

        {loading ? (
          <p>
            Chargement...
          </p>
        ) : (
          <div
            style={{
              overflowX:
                'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse:
                  'collapse',
              }}
            >
              <thead>
                <tr>
                  <th>E-mail</th>
                  <th>Nom</th>
                  <th>Rôles</th>
                  <th>Profil lié</th>
                  <th>Statut</th>
                  <th>Gestion rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {resultat.map(
                  (user) => {
                    const codes =
                      roleCodes(
                        user,
                      );

                    return (
                      <tr
                        key={
                          user.id
                        }
                      >
                        <td>
                          {user.email}
                        </td>

                        <td>
                          {user.nomAffichage ??
                            '—'}
                        </td>

                        <td>
                          <div
                            style={{
                              display:
                                'flex',
                              gap: 6,
                              flexWrap:
                                'wrap',
                            }}
                          >
                            {codes.map(
                              (
                                code,
                              ) => (
                                <button
                                  key={
                                    code
                                  }
                                  type="button"
                                  title="Retirer ce rôle"
                                  onClick={
                                    () =>
                                      retirerRole(
                                        user,
                                        code,
                                      )
                                  }
                                >
                                  {code} ×
                                </button>
                              ),
                            )}
                          </div>
                        </td>

                        <td>
                          {user.etudiant
                            ? `Étudiant : ${user.etudiant.matricule ?? user.etudiant.id}`
                            : user.enseignant
                              ? `Enseignant : ${user.enseignant.matricule ?? user.enseignant.id}`
                              : '—'}
                        </td>

                        <td>
                          {user.actif
                            ? 'Actif'
                            : 'Inactif'}
                        </td>

                        <td>
                          <div
                            style={{
                              display:
                                'flex',
                              gap: 6,
                            }}
                          >
                            <select
                              value={
                                selectedRoleByUser[
                                  user.id
                                ] ?? ''
                              }
                              onChange={
                                (event) =>
                                  setSelectedRoleByUser(
                                    {
                                      ...selectedRoleByUser,

                                      [user.id]:
                                        event.target.value,
                                    },
                                  )
                              }
                            >
                              <option value="">
                                Ajouter rôle
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

                            <button
                              type="button"
                              onClick={
                                () =>
                                  ajouterRole(
                                    user,
                                  )
                              }
                            >
                              Ajouter
                            </button>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            disabled={
                              busy
                            }
                            onClick={
                              () =>
                                changerEtat(
                                  user,
                                )
                            }
                          >
                            {user.actif
                              ? 'Désactiver'
                              : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}