import {
  useCallback,
  useEffect,
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

interface Affectation {
  id: number;
  anneeAcademique: string;

  cours?: {
    id: number;
    code: string;
    intitule: string;
    volumeHoraire: number;
  };

  classe?: {
    id: number;
    code: string;
    nom: string;
  };
}

interface Seance {
  id: number;
  affectationId: number;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  contenu: string;
  observations?: string | null;
  statut: string;

  affectation?: Affectation;
}

interface Inscription {
  id: number;
  anneeAcademique: string;
  statut: string;

  classe?: {
    code?: string;
    nom?: string;

    niveau?: {
      code?: string;
      nom?: string;

      formation?: {
        code?: string;
        nom?: string;
      };
    };
  };

  validationAcademique?: {
    decision?: string;
  } | null;

  demandeDiplome?: unknown;
}

export function MonEspacePage() {
  const {
    user,
  } = useAuth();

  if (
    user?.roles.includes(
      'ENSEIGNANT',
    )
  ) {
    return (
      <EspaceEnseignant />
    );
  }

  if (
    user?.roles.includes(
      'ETUDIANT',
    )
  ) {
    return (
      <EspaceEtudiant />
    );
  }

  return (
    <EspaceProfil />
  );
}

function EspaceEnseignant() {
  const [
    affectations,
    setAffectations,
  ] =
    useState<Affectation[]>([]);

  const [
    seances,
    setSeances,
  ] =
    useState<Seance[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

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

  const [
    form,
    setForm,
  ] =
    useState({
      affectationId: '',
      dateSeance:
        new Date()
          .toISOString()
          .slice(0, 10),

      heureDebut: '08:00',
      heureFin: '10:00',
      contenu: '',
      observations: '',
    });

  const load =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const [
            affectationsData,
            seancesData,
          ] =
            await Promise.all([
              api<Affectation[]>(
                '/me/enseignant/affectations',
              ),

              api<Seance[]>(
                '/me/enseignant/seances',
              ),
            ]);

          setAffectations(
            affectationsData,
          );

          setSeances(
            seancesData,
          );

          if (
            !form.affectationId &&
            affectationsData.length
          ) {
            setForm(
              (current) => ({
                ...current,

                affectationId:
                  String(
                    affectationsData[0]
                      .id,
                  ),
              }),
            );
          }
        }
        catch (err) {
          setError(
            err instanceof ApiException
              ? err.message
              : 'Chargement impossible.',
          );
        }
        finally {
          setLoading(false);
        }
      },
      [
        form.affectationId,
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

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');

    try {
      await api(
        '/me/enseignant/seances',
        {
          method: 'POST',

          body:
            JSON.stringify({
              affectationId:
                Number(
                  form.affectationId,
                ),

              dateSeance:
                form.dateSeance,

              heureDebut:
                form.heureDebut,

              heureFin:
                form.heureFin,

              contenu:
                form.contenu,

              observations:
                form.observations ||
                undefined,
            }),
        },
      );

      setMessage(
        'Séance déclarée et transmise pour validation.',
      );

      setForm(
        (current) => ({
          ...current,
          contenu: '',
          observations: '',
        }),
      );

      await load();

      window.setTimeout(
        () =>
          setMessage(''),
        3000,
      );
    }
    catch (err) {
      setError(
        err instanceof ApiException
          ? err.message
          : 'Déclaration impossible.',
      );
    }
  }

  if (loading) {
    return (
      <section className="panel">
        Chargement de votre espace enseignant...
      </section>
    );
  }

  const heuresDeclarees =
    seances.reduce(
      (total, item) =>
        total +
        item.dureeMinutes,
      0,
    );

  const heuresValidees =
    seances
      .filter(
        (item) =>
          item.statut ===
          'VALIDEE',
      )
      .reduce(
        (total, item) =>
          total +
          item.dureeMinutes,
        0,
      );

  return (
    <div className="page-stack">

      <section className="page-header">
        <div>
          <span className="eyebrow">
            Espace enseignant
          </span>

          <h1>
            Mes enseignements
          </h1>

          <p>
            Consultez vos affectations
            et déclarez les séances
            réellement effectuées.
          </p>
        </div>
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

      <section className="stat-grid">

        <article className="stat-card">
          <span>
            Affectations
          </span>

          <strong>
            {affectations.length}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Séances déclarées
          </span>

          <strong>
            {seances.length}
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Heures déclarées
          </span>

          <strong>
            {
              (
                heuresDeclarees /
                60
              ).toFixed(1)
            } h
          </strong>
        </article>

        <article className="stat-card">
          <span>
            Heures validées
          </span>

          <strong>
            {
              (
                heuresValidees /
                60
              ).toFixed(1)
            } h
          </strong>
        </article>

      </section>

      <section className="teacher-space-grid">

        <article className="panel">

          <h2>
            Déclarer une séance
          </h2>

          {
            affectations.length ===
            0
              ? (
                <p className="muted">
                  Vous n'avez actuellement
                  aucune affectation.
                </p>
              )
              : (
                <form
                  className="form-grid"
                  onSubmit={submit}
                >

                  <label>
                    Affectation

                    <select
                      value={
                        form.affectationId
                      }
                      required
                      onChange={
                        (event) =>
                          setForm({
                            ...form,

                            affectationId:
                              event.target
                                .value,
                          })
                      }
                    >
                      {
                        affectations.map(
                          (item) => (
                            <option
                              key={
                                item.id
                              }
                              value={
                                item.id
                              }
                            >
                              {
                                item.cours
                                  ?.code ??
                                'Cours'
                              } — {
                                item.cours
                                  ?.intitule ??
                                `#${item.id}`
                              } / {
                                item.classe
                                  ?.nom ??
                                'Classe'
                              }
                            </option>
                          ),
                        )
                      }
                    </select>
                  </label>

                  <label>
                    Date

                    <input
                      type="date"
                      required
                      value={
                        form.dateSeance
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,

                            dateSeance:
                              event.target
                                .value,
                          })
                      }
                    />
                  </label>

                  <div className="two-columns">

                    <label>
                      Heure début

                      <input
                        type="time"
                        required
                        value={
                          form.heureDebut
                        }
                        onChange={
                          (event) =>
                            setForm({
                              ...form,

                              heureDebut:
                                event.target
                                  .value,
                            })
                        }
                      />
                    </label>

                    <label>
                      Heure fin

                      <input
                        type="time"
                        required
                        value={
                          form.heureFin
                        }
                        onChange={
                          (event) =>
                            setForm({
                              ...form,

                              heureFin:
                                event.target
                                  .value,
                            })
                        }
                      />
                    </label>

                  </div>

                  <label>
                    Contenu réalisé

                    <textarea
                      required
                      rows={5}
                      value={
                        form.contenu
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,

                            contenu:
                              event.target
                                .value,
                          })
                      }
                    />
                  </label>

                  <label>
                    Observations

                    <textarea
                      rows={3}
                      value={
                        form.observations
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,

                            observations:
                              event.target
                                .value,
                          })
                      }
                    />
                  </label>

                  <button
                    className="primary-button"
                    type="submit"
                  >
                    Déclarer la séance
                  </button>

                </form>
              )
          }

        </article>

        <article className="panel">
          <h2>
            Mes affectations
          </h2>

          <div className="assignment-list">

            {
              affectations.length ===
              0
                ? (
                  <p className="muted">
                    Aucune affectation.
                  </p>
                )
                : affectations.map(
                    (item) => (
                      <article
                        className="assignment-card"
                        key={
                          item.id
                        }
                      >
                        <strong>
                          {
                            item.cours
                              ?.code ??
                            'Cours'
                          } — {
                            item.cours
                              ?.intitule ??
                            '-'
                          }
                        </strong>

                        <span>
                          {
                            item.classe
                              ?.nom ??
                            '-'
                          }
                        </span>

                        <small>
                          {
                            item.anneeAcademique
                          }
                        </small>
                      </article>
                    ),
                  )
            }

          </div>
        </article>

      </section>

      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>
                Date
              </th>
              <th>
                Cours
              </th>
              <th>
                Horaire
              </th>
              <th>
                Durée
              </th>
              <th>
                Statut
              </th>
            </tr>
          </thead>

          <tbody>
            {
              seances.map(
                (item) => (
                  <tr
                    key={
                      item.id
                    }
                  >
                    <td>
                      {
                        new Date(
                          item.dateSeance,
                        )
                          .toLocaleDateString(
                            'fr-FR',
                          )
                      }
                    </td>

                    <td>
                      {
                        item.affectation
                          ?.cours
                          ?.intitule ??
                        `Affectation #${item.affectationId}`
                      }
                    </td>

                    <td>
                      {
                        item.heureDebut
                      } – {
                        item.heureFin
                      }
                    </td>

                    <td>
                      {
                        (
                          item.dureeMinutes /
                          60
                        ).toFixed(1)
                      } h
                    </td>

                    <td>
                      <span
                        className={
                          `status session-status ${item.statut.toLowerCase()}`
                        }
                      >
                        {
                          item.statut
                        }
                      </span>
                    </td>
                  </tr>
                ),
              )
            }
          </tbody>
        </table>
      </section>

    </div>
  );
}

function EspaceEtudiant() {
  const [
    inscriptions,
    setInscriptions,
  ] =
    useState<Inscription[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  useEffect(
    () => {
      api<Inscription[]>(
        '/me/etudiant/inscriptions',
      )
        .then(
          setInscriptions,
        )
        .catch(
          (err) =>
            setError(
              err instanceof ApiException
                ? err.message
                : 'Chargement impossible.',
            ),
        )
        .finally(
          () =>
            setLoading(false),
        );
    },
    [],
  );

  if (loading) {
    return (
      <section className="panel">
        Chargement de votre dossier...
      </section>
    );
  }

  return (
    <div className="page-stack">

      <section className="page-header">
        <div>
          <span className="eyebrow">
            Espace étudiant
          </span>

          <h1>
            Mon parcours
          </h1>

          <p>
            Inscriptions et situation
            académique.
          </p>
        </div>
      </section>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <section className="panel table-panel">

        <table>
          <thead>
            <tr>
              <th>
                Année
              </th>
              <th>
                Formation
              </th>
              <th>
                Niveau
              </th>
              <th>
                Classe
              </th>
              <th>
                Statut
              </th>
            </tr>
          </thead>

          <tbody>
            {
              inscriptions.map(
                (item) => (
                  <tr
                    key={
                      item.id
                    }
                  >
                    <td>
                      {
                        item.anneeAcademique
                      }
                    </td>

                    <td>
                      {
                        item.classe
                          ?.niveau
                          ?.formation
                          ?.nom ??
                        '-'
                      }
                    </td>

                    <td>
                      {
                        item.classe
                          ?.niveau
                          ?.nom ??
                        '-'
                      }
                    </td>

                    <td>
                      {
                        item.classe
                          ?.nom ??
                        '-'
                      }
                    </td>

                    <td>
                      {
                        item.statut
                      }
                    </td>
                  </tr>
                ),
              )
            }
          </tbody>
        </table>

      </section>

    </div>
  );
}

function EspaceProfil() {
  const [
    data,
    setData,
  ] =
    useState<unknown>(null);

  useEffect(
    () => {
      api(
        '/me/profil',
      ).then(
        setData,
      );
    },
    [],
  );

  return (
    <div className="page-stack">

      <section className="page-header">
        <div>
          <span className="eyebrow">
            Mon compte
          </span>

          <h1>
            Mon profil
          </h1>
        </div>
      </section>

      <section className="panel">
        <pre className="json-preview">
          {
            JSON.stringify(
              data,
              null,
              2,
            )
          }
        </pre>
      </section>

    </div>
  );
}
