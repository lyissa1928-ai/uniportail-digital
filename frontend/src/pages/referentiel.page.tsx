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

type Tab =
  | 'filieres'
  | 'formations'
  | 'niveaux'
  | 'classes'
  | 'cours';

interface Filiere {
  id: number;
  code: string;
  nom: string;
  description?: string | null;
  actif: boolean;
}

interface Formation {
  id: number;
  code: string;
  nom: string;
  description?: string | null;
  actif: boolean;
  filiereId: number;
  filiere?: Filiere;
}

interface Niveau {
  id: number;
  code: string;
  nom: string;
  ordre: number;
  terminal: boolean;
  actif: boolean;
  formationId: number;
  formation?: Formation;
}

interface Classe {
  id: number;
  code: string;
  nom: string;
  annee: string;
  actif: boolean;
  niveauId: number;
  niveau?: Niveau;
}

interface Cours {
  id: number;
  code: string;
  intitule: string;
  volumeHoraire: number;
  credits: number;
  semestre: number;
  actif: boolean;
  niveauId: number;
  niveau?: Niveau;
}

const emptyFiliere = {
  code: '',
  nom: '',
  description: '',
  actif: true,
};

const emptyFormation = {
  code: '',
  nom: '',
  description: '',
  actif: true,
  filiereId: '',
};

const emptyNiveau = {
  code: '',
  nom: '',
  ordre: '1',
  terminal: false,
  actif: true,
  formationId: '',
};

const emptyClasse = {
  code: '',
  nom: '',
  annee: '2026-2027',
  actif: true,
  niveauId: '',
};

const emptyCours = {
  code: '',
  intitule: '',
  volumeHoraire: '20',
  credits: '3',
  semestre: '1',
  actif: true,
  niveauId: '',
};

export function ReferentielPage() {
  const {
    user,
  } = useAuth();

  const [
    tab,
    setTab,
  ] =
    useState<Tab>('filieres');

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    message,
    setMessage,
  ] =
    useState('');

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    editingId,
    setEditingId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    filieres,
    setFilieres,
  ] =
    useState<Filiere[]>([]);

  const [
    formations,
    setFormations,
  ] =
    useState<Formation[]>([]);

  const [
    niveaux,
    setNiveaux,
  ] =
    useState<Niveau[]>([]);

  const [
    classes,
    setClasses,
  ] =
    useState<Classe[]>([]);

  const [
    cours,
    setCours,
  ] =
    useState<Cours[]>([]);

  const [
    filiereForm,
    setFiliereForm,
  ] =
    useState(emptyFiliere);

  const [
    formationForm,
    setFormationForm,
  ] =
    useState(emptyFormation);

  const [
    niveauForm,
    setNiveauForm,
  ] =
    useState(emptyNiveau);

  const [
    classeForm,
    setClasseForm,
  ] =
    useState(emptyClasse);

  const [
    coursForm,
    setCoursForm,
  ] =
    useState(emptyCours);

  const canManage =
    user?.permissions.includes(
      'REFERENTIEL_GERER',
    ) ?? false;

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const [
            f1,
            f2,
            n,
            c,
            crs,
          ] =
            await Promise.all([
              api<Filiere[]>(
                '/filieres',
              ),

              api<Formation[]>(
                '/formations',
              ),

              api<Niveau[]>(
                '/niveaux',
              ),

              api<Classe[]>(
                '/classes',
              ),

              api<Cours[]>(
                '/cours',
              ),
            ]);

          setFilieres(f1);
          setFormations(f2);
          setNiveaux(n);
          setClasses(c);
          setCours(crs);
        }
        catch (err) {
          setError(
            err instanceof ApiException
              ? err.message
              : 'Chargement impossible',
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
    text: string,
  ) {
    setMessage(text);
    setError('');

    window.setTimeout(
      () =>
        setMessage(''),
      2500,
    );
  }

  function fail(
    err: unknown,
  ) {
    setError(
      err instanceof ApiException
        ? err.message
        : 'Une erreur est survenue',
    );
  }

  function resetForms() {
    setEditingId(null);
    setFiliereForm(
      emptyFiliere,
    );
    setFormationForm(
      emptyFormation,
    );
    setNiveauForm(
      emptyNiveau,
    );
    setClasseForm(
      emptyClasse,
    );
    setCoursForm(
      emptyCours,
    );
  }

  async function remove(
    endpoint: string,
    id: number,
  ) {
    if (
      !window.confirm(
        'Confirmer la suppression ?',
      )
    ) {
      return;
    }

    try {
      await api(
        `${endpoint}/${id}`,
        {
          method: 'DELETE',
        },
      );

      notify(
        'Élément supprimé.',
      );

      resetForms();

      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  const query =
    search
      .trim()
      .toLowerCase();

  const filteredFilieres =
    useMemo(
      () =>
        filieres.filter(
          (item) =>
            `${item.code} ${item.nom}`
              .toLowerCase()
              .includes(query),
        ),
      [
        filieres,
        query,
      ],
    );

  const filteredFormations =
    useMemo(
      () =>
        formations.filter(
          (item) =>
            `${item.code} ${item.nom}`
              .toLowerCase()
              .includes(query),
        ),
      [
        formations,
        query,
      ],
    );

  const filteredNiveaux =
    useMemo(
      () =>
        niveaux.filter(
          (item) =>
            `${item.code} ${item.nom}`
              .toLowerCase()
              .includes(query),
        ),
      [
        niveaux,
        query,
      ],
    );

  const filteredClasses =
    useMemo(
      () =>
        classes.filter(
          (item) =>
            `${item.code} ${item.nom} ${item.annee}`
              .toLowerCase()
              .includes(query),
        ),
      [
        classes,
        query,
      ],
    );

  const filteredCours =
    useMemo(
      () =>
        cours.filter(
          (item) =>
            `${item.code} ${item.intitule}`
              .toLowerCase()
              .includes(query),
        ),
      [
        cours,
        query,
      ],
    );

  async function saveFiliere(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      const path =
        editingId
          ? `/filieres/${editingId}`
          : '/filieres';

      await api(
        path,
        {
          method:
            editingId
              ? 'PATCH'
              : 'POST',

          body:
            JSON.stringify(
              filiereForm,
            ),
        },
      );

      notify(
        editingId
          ? 'Filière modifiée.'
          : 'Filière créée.',
      );

      resetForms();
      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function saveFormation(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      await api(
        editingId
          ? `/formations/${editingId}`
          : '/formations',
        {
          method:
            editingId
              ? 'PATCH'
              : 'POST',

          body:
            JSON.stringify({
              ...formationForm,

              filiereId:
                Number(
                  formationForm
                    .filiereId,
                ),
            }),
        },
      );

      notify(
        editingId
          ? 'Formation modifiée.'
          : 'Formation créée.',
      );

      resetForms();
      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function saveNiveau(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      await api(
        editingId
          ? `/niveaux/${editingId}`
          : '/niveaux',
        {
          method:
            editingId
              ? 'PATCH'
              : 'POST',

          body:
            JSON.stringify({
              ...niveauForm,

              ordre:
                Number(
                  niveauForm
                    .ordre,
                ),

              formationId:
                Number(
                  niveauForm
                    .formationId,
                ),
            }),
        },
      );

      notify(
        editingId
          ? 'Niveau modifié.'
          : 'Niveau créé.',
      );

      resetForms();
      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function saveClasse(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      await api(
        editingId
          ? `/classes/${editingId}`
          : '/classes',
        {
          method:
            editingId
              ? 'PATCH'
              : 'POST',

          body:
            JSON.stringify({
              ...classeForm,

              niveauId:
                Number(
                  classeForm
                    .niveauId,
                ),
            }),
        },
      );

      notify(
        editingId
          ? 'Classe modifiée.'
          : 'Classe créée.',
      );

      resetForms();
      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function saveCours(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      await api(
        editingId
          ? `/cours/${editingId}`
          : '/cours',
        {
          method:
            editingId
              ? 'PATCH'
              : 'POST',

          body:
            JSON.stringify({
              ...coursForm,

              volumeHoraire:
                Number(
                  coursForm
                    .volumeHoraire,
                ),

              credits:
                Number(
                  coursForm
                    .credits,
                ),

              semestre:
                Number(
                  coursForm
                    .semestre,
                ),

              niveauId:
                Number(
                  coursForm
                    .niveauId,
                ),
            }),
        },
      );

      notify(
        editingId
          ? 'Cours modifié.'
          : 'Cours créé.',
      );

      resetForms();
      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  if (loading) {
    return (
      <section className="panel">
        Chargement du référentiel...
      </section>
    );
  }

  return (
    <div className="page-stack referentiel-premium">

      <section className="page-header">
        <div>
          <span className="eyebrow">
            Administration académique
          </span>

          <h1>
            Référentiel
          </h1>

          <p>
            Structure académique
            utilisée par l'ensemble de
            la plateforme.
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

      <section className="referentiel-stats">

        <div>
          <strong>
            {filieres.length}
          </strong>
          <span>
            Filières
          </span>
        </div>

        <div>
          <strong>
            {formations.length}
          </strong>
          <span>
            Formations
          </span>
        </div>

        <div>
          <strong>
            {niveaux.length}
          </strong>
          <span>
            Niveaux
          </span>
        </div>

        <div>
          <strong>
            {classes.length}
          </strong>
          <span>
            Classes
          </span>
        </div>

        <div>
          <strong>
            {cours.length}
          </strong>
          <span>
            Cours
          </span>
        </div>

      </section>

      <section className="panel">

        <div className="toolbar">

          <div className="tabs">
            {
              [
                [
                  'filieres',
                  'Filières',
                ],
                [
                  'formations',
                  'Formations',
                ],
                [
                  'niveaux',
                  'Niveaux',
                ],
                [
                  'classes',
                  'Classes',
                ],
                [
                  'cours',
                  'Cours',
                ],
              ].map(
                ([
                  value,
                  label,
                ]) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      tab === value
                        ? 'tab active'
                        : 'tab'
                    }
                    onClick={() => {
                      setTab(
                        value as Tab,
                      );

                      resetForms();
                    }}
                  >
                    {label}
                  </button>
                ),
              )
            }
          </div>

          <input
            className="search-input"
            value={search}
            onChange={
              (event) =>
                setSearch(
                  event.target.value,
                )
            }
            placeholder="Rechercher..."
          />

        </div>

      </section>

      <section className="crud-layout">

        <article className="panel table-panel">

          {
            tab ===
              'filieres' && (
              <table>
                <thead>
                  <tr>
                    <th>
                      Code
                    </th>
                    <th>
                      Filière
                    </th>
                    <th>
                      Statut
                    </th>
                    {
                      canManage &&
                      (
                        <th>
                          Actions
                        </th>
                      )
                    }
                  </tr>
                </thead>

                <tbody>
                  {
                    filteredFilieres
                      .map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  item.code
                                }
                              </strong>
                            </td>

                            <td>
                              {item.nom}
                            </td>

                            <td>
                              <Status
                                actif={
                                  item.actif
                                }
                              />
                            </td>

                            {
                              canManage &&
                              (
                                <td>
                                  <ActionButtons
                                    onEdit={() => {
                                      setEditingId(
                                        item.id,
                                      );

                                      setFiliereForm({
                                        code:
                                          item.code,

                                        nom:
                                          item.nom,

                                        description:
                                          item.description ??
                                          '',

                                        actif:
                                          item.actif,
                                      });
                                    }}

                                    onDelete={() =>
                                      void remove(
                                        '/filieres',
                                        item.id,
                                      )
                                    }
                                  />
                                </td>
                              )
                            }
                          </tr>
                        ),
                      )
                  }
                </tbody>
              </table>
            )
          }

          {
            tab ===
              'formations' && (
              <table>
                <thead>
                  <tr>
                    <th>
                      Code
                    </th>
                    <th>
                      Formation
                    </th>
                    <th>
                      Filière
                    </th>
                    <th>
                      Statut
                    </th>
                    {
                      canManage &&
                      <th>
                        Actions
                      </th>
                    }
                  </tr>
                </thead>

                <tbody>
                  {
                    filteredFormations
                      .map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  item.code
                                }
                              </strong>
                            </td>

                            <td>
                              {item.nom}
                            </td>

                            <td>
                              {
                                item.filiere
                                  ?.nom ??
                                filieres.find(
                                  (x) =>
                                    x.id ===
                                    item.filiereId,
                                )?.nom ??
                                '-'
                              }
                            </td>

                            <td>
                              <Status
                                actif={
                                  item.actif
                                }
                              />
                            </td>

                            {
                              canManage &&
                              (
                                <td>
                                  <ActionButtons
                                    onEdit={() => {
                                      setEditingId(
                                        item.id,
                                      );

                                      setFormationForm({
                                        code:
                                          item.code,

                                        nom:
                                          item.nom,

                                        description:
                                          item.description ??
                                          '',

                                        actif:
                                          item.actif,

                                        filiereId:
                                          String(
                                            item.filiereId,
                                          ),
                                      });
                                    }}

                                    onDelete={() =>
                                      void remove(
                                        '/formations',
                                        item.id,
                                      )
                                    }
                                  />
                                </td>
                              )
                            }
                          </tr>
                        ),
                      )
                  }
                </tbody>
              </table>
            )
          }

          {
            tab ===
              'niveaux' && (
              <table>
                <thead>
                  <tr>
                    <th>
                      Code
                    </th>
                    <th>
                      Niveau
                    </th>
                    <th>
                      Formation
                    </th>
                    <th>
                      Terminal
                    </th>
                    {
                      canManage &&
                      <th>
                        Actions
                      </th>
                    }
                  </tr>
                </thead>

                <tbody>
                  {
                    filteredNiveaux
                      .map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  item.code
                                }
                              </strong>
                            </td>

                            <td>
                              {item.nom}
                            </td>

                            <td>
                              {
                                formations.find(
                                  (x) =>
                                    x.id ===
                                    item.formationId,
                                )?.nom ??
                                '-'
                              }
                            </td>

                            <td>
                              {
                                item.terminal
                                  ? 'Oui'
                                  : 'Non'
                              }
                            </td>

                            {
                              canManage &&
                              (
                                <td>
                                  <ActionButtons
                                    onEdit={() => {
                                      setEditingId(
                                        item.id,
                                      );

                                      setNiveauForm({
                                        code:
                                          item.code,

                                        nom:
                                          item.nom,

                                        ordre:
                                          String(
                                            item.ordre,
                                          ),

                                        terminal:
                                          item.terminal,

                                        actif:
                                          item.actif,

                                        formationId:
                                          String(
                                            item.formationId,
                                          ),
                                      });
                                    }}

                                    onDelete={() =>
                                      void remove(
                                        '/niveaux',
                                        item.id,
                                      )
                                    }
                                  />
                                </td>
                              )
                            }
                          </tr>
                        ),
                      )
                  }
                </tbody>
              </table>
            )
          }

          {
            tab ===
              'classes' && (
              <table>
                <thead>
                  <tr>
                    <th>
                      Code
                    </th>
                    <th>
                      Classe
                    </th>
                    <th>
                      Année
                    </th>
                    <th>
                      Niveau
                    </th>
                    {
                      canManage &&
                      <th>
                        Actions
                      </th>
                    }
                  </tr>
                </thead>

                <tbody>
                  {
                    filteredClasses
                      .map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  item.code
                                }
                              </strong>
                            </td>

                            <td>
                              {item.nom}
                            </td>

                            <td>
                              {item.annee}
                            </td>

                            <td>
                              {
                                niveaux.find(
                                  (x) =>
                                    x.id ===
                                    item.niveauId,
                                )?.nom ??
                                '-'
                              }
                            </td>

                            {
                              canManage &&
                              (
                                <td>
                                  <ActionButtons
                                    onEdit={() => {
                                      setEditingId(
                                        item.id,
                                      );

                                      setClasseForm({
                                        code:
                                          item.code,

                                        nom:
                                          item.nom,

                                        annee:
                                          item.annee,

                                        actif:
                                          item.actif,

                                        niveauId:
                                          String(
                                            item.niveauId,
                                          ),
                                      });
                                    }}

                                    onDelete={() =>
                                      void remove(
                                        '/classes',
                                        item.id,
                                      )
                                    }
                                  />
                                </td>
                              )
                            }
                          </tr>
                        ),
                      )
                  }
                </tbody>
              </table>
            )
          }

          {
            tab ===
              'cours' && (
              <table>
                <thead>
                  <tr>
                    <th>
                      Code
                    </th>
                    <th>
                      Cours
                    </th>
                    <th>
                      VH
                    </th>
                    <th>
                      Crédits
                    </th>
                    <th>
                      Sem.
                    </th>
                    {
                      canManage &&
                      <th>
                        Actions
                      </th>
                    }
                  </tr>
                </thead>

                <tbody>
                  {
                    filteredCours
                      .map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  item.code
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                item.intitule
                              }
                            </td>

                            <td>
                              {
                                item.volumeHoraire
                              } h
                            </td>

                            <td>
                              {
                                item.credits
                              }
                            </td>

                            <td>
                              S{
                                item.semestre
                              }
                            </td>

                            {
                              canManage &&
                              (
                                <td>
                                  <ActionButtons
                                    onEdit={() => {
                                      setEditingId(
                                        item.id,
                                      );

                                      setCoursForm({
                                        code:
                                          item.code,

                                        intitule:
                                          item.intitule,

                                        volumeHoraire:
                                          String(
                                            item.volumeHoraire,
                                          ),

                                        credits:
                                          String(
                                            item.credits,
                                          ),

                                        semestre:
                                          String(
                                            item.semestre,
                                          ),

                                        actif:
                                          item.actif,

                                        niveauId:
                                          String(
                                            item.niveauId,
                                          ),
                                      });
                                    }}

                                    onDelete={() =>
                                      void remove(
                                        '/cours',
                                        item.id,
                                      )
                                    }
                                  />
                                </td>
                              )
                            }
                          </tr>
                        ),
                      )
                  }
                </tbody>
              </table>
            )
          }

        </article>

        {
          canManage &&
          (
            <article className="panel">

              <div className="form-heading">
                <h2>
                  {
                    editingId
                      ? 'Modifier'
                      : 'Ajouter'
                  }
                </h2>

                {
                  editingId &&
                  (
                    <button
                      type="button"
                      className="text-button"
                      onClick={
                        resetForms
                      }
                    >
                      Annuler
                    </button>
                  )
                }
              </div>

              {
                tab ===
                  'filieres' &&
                (
                  <form
                    className="form-grid"
                    onSubmit={
                      saveFiliere
                    }
                  >
                    <Field
                      label="Code"
                      value={
                        filiereForm.code
                      }
                      onChange={
                        (value) =>
                          setFiliereForm({
                            ...filiereForm,
                            code:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Nom"
                      value={
                        filiereForm.nom
                      }
                      onChange={
                        (value) =>
                          setFiliereForm({
                            ...filiereForm,
                            nom:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Description"
                      value={
                        filiereForm
                          .description
                      }
                      required={
                        false
                      }
                      onChange={
                        (value) =>
                          setFiliereForm({
                            ...filiereForm,
                            description:
                              value,
                          })
                      }
                    />

                    <SubmitButton
                      editing={
                        !!editingId
                      }
                    />
                  </form>
                )
              }

              {
                tab ===
                  'formations' &&
                (
                  <form
                    className="form-grid"
                    onSubmit={
                      saveFormation
                    }
                  >
                    <Field
                      label="Code"
                      value={
                        formationForm.code
                      }
                      onChange={
                        (value) =>
                          setFormationForm({
                            ...formationForm,
                            code:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Nom"
                      value={
                        formationForm.nom
                      }
                      onChange={
                        (value) =>
                          setFormationForm({
                            ...formationForm,
                            nom:
                              value,
                          })
                      }
                    />

                    <Select
                      label="Filière"
                      value={
                        formationForm
                          .filiereId
                      }
                      options={
                        filieres.map(
                          (item) => ({
                            value:
                              String(
                                item.id,
                              ),

                            label:
                              `${item.code} — ${item.nom}`,
                          }),
                        )
                      }
                      onChange={
                        (value) =>
                          setFormationForm({
                            ...formationForm,
                            filiereId:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Description"
                      required={
                        false
                      }
                      value={
                        formationForm
                          .description
                      }
                      onChange={
                        (value) =>
                          setFormationForm({
                            ...formationForm,
                            description:
                              value,
                          })
                      }
                    />

                    <SubmitButton
                      editing={
                        !!editingId
                      }
                    />
                  </form>
                )
              }

              {
                tab ===
                  'niveaux' &&
                (
                  <form
                    className="form-grid"
                    onSubmit={
                      saveNiveau
                    }
                  >
                    <Field
                      label="Code"
                      value={
                        niveauForm.code
                      }
                      onChange={
                        (value) =>
                          setNiveauForm({
                            ...niveauForm,
                            code:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Nom"
                      value={
                        niveauForm.nom
                      }
                      onChange={
                        (value) =>
                          setNiveauForm({
                            ...niveauForm,
                            nom:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Ordre"
                      type="number"
                      value={
                        niveauForm.ordre
                      }
                      onChange={
                        (value) =>
                          setNiveauForm({
                            ...niveauForm,
                            ordre:
                              value,
                          })
                      }
                    />

                    <Select
                      label="Formation"
                      value={
                        niveauForm
                          .formationId
                      }
                      options={
                        formations.map(
                          (item) => ({
                            value:
                              String(
                                item.id,
                              ),

                            label:
                              `${item.code} — ${item.nom}`,
                          }),
                        )
                      }
                      onChange={
                        (value) =>
                          setNiveauForm({
                            ...niveauForm,
                            formationId:
                              value,
                          })
                      }
                    />

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={
                          niveauForm
                            .terminal
                        }
                        onChange={
                          (event) =>
                            setNiveauForm({
                              ...niveauForm,

                              terminal:
                                event
                                  .target
                                  .checked,
                            })
                        }
                      />

                      Niveau terminal
                    </label>

                    <SubmitButton
                      editing={
                        !!editingId
                      }
                    />
                  </form>
                )
              }

              {
                tab ===
                  'classes' &&
                (
                  <form
                    className="form-grid"
                    onSubmit={
                      saveClasse
                    }
                  >
                    <Field
                      label="Code"
                      value={
                        classeForm.code
                      }
                      onChange={
                        (value) =>
                          setClasseForm({
                            ...classeForm,
                            code:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Nom"
                      value={
                        classeForm.nom
                      }
                      onChange={
                        (value) =>
                          setClasseForm({
                            ...classeForm,
                            nom:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Année académique"
                      value={
                        classeForm.annee
                      }
                      onChange={
                        (value) =>
                          setClasseForm({
                            ...classeForm,
                            annee:
                              value,
                          })
                      }
                    />

                    <Select
                      label="Niveau"
                      value={
                        classeForm
                          .niveauId
                      }
                      options={
                        niveaux.map(
                          (item) => ({
                            value:
                              String(
                                item.id,
                              ),

                            label:
                              `${item.code} — ${item.nom}`,
                          }),
                        )
                      }
                      onChange={
                        (value) =>
                          setClasseForm({
                            ...classeForm,
                            niveauId:
                              value,
                          })
                      }
                    />

                    <SubmitButton
                      editing={
                        !!editingId
                      }
                    />
                  </form>
                )
              }

              {
                tab ===
                  'cours' &&
                (
                  <form
                    className="form-grid"
                    onSubmit={
                      saveCours
                    }
                  >
                    <Field
                      label="Code"
                      value={
                        coursForm.code
                      }
                      onChange={
                        (value) =>
                          setCoursForm({
                            ...coursForm,
                            code:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Intitulé"
                      value={
                        coursForm
                          .intitule
                      }
                      onChange={
                        (value) =>
                          setCoursForm({
                            ...coursForm,
                            intitule:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Volume horaire"
                      type="number"
                      value={
                        coursForm
                          .volumeHoraire
                      }
                      onChange={
                        (value) =>
                          setCoursForm({
                            ...coursForm,
                            volumeHoraire:
                              value,
                          })
                      }
                    />

                    <Field
                      label="Crédits"
                      type="number"
                      value={
                        coursForm.credits
                      }
                      onChange={
                        (value) =>
                          setCoursForm({
                            ...coursForm,
                            credits:
                              value,
                          })
                      }
                    />

                    <Select
                      label="Semestre"
                      value={
                        coursForm.semestre
                      }
                      options={[
                        {
                          value:
                            '1',
                          label:
                            'Semestre 1',
                        },
                        {
                          value:
                            '2',
                          label:
                            'Semestre 2',
                        },
                      ]}
                      onChange={
                        (value) =>
                          setCoursForm({
                            ...coursForm,
                            semestre:
                              value,
                          })
                      }
                    />

                    <Select
                      label="Niveau"
                      value={
                        coursForm
                          .niveauId
                      }
                      options={
                        niveaux.map(
                          (item) => ({
                            value:
                              String(
                                item.id,
                              ),

                            label:
                              `${item.code} — ${item.nom}`,
                          }),
                        )
                      }
                      onChange={
                        (value) =>
                          setCoursForm({
                            ...coursForm,
                            niveauId:
                              value,
                          })
                      }
                    />

                    <SubmitButton
                      editing={
                        !!editingId
                      }
                    />
                  </form>
                )
              }

            </article>
          )
        }

      </section>

    </div>
  );
}

function Status({
  actif,
}: {
  actif: boolean;
}) {
  return (
    <span
      className={
        actif
          ? 'status active'
          : 'status inactive'
      }
    >
      {actif
        ? 'Actif'
        : 'Inactif'}
    </span>
  );
}

function ActionButtons({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="action-buttons">

      <button
        type="button"
        onClick={onEdit}
      >
        Modifier
      </button>

      <button
        type="button"
        className="danger-link"
        onClick={onDelete}
      >
        Supprimer
      </button>

    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = true,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      {label}

      <input
        type={type}
        value={value}
        required={required}
        onChange={
          (event) =>
            onChange(
              event.target.value,
            )
        }
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;

  options: Array<{
    value: string;
    label: string;
  }>;

  onChange:
    (value: string) => void;
}) {
  return (
    <label>
      {label}

      <select
        value={value}
        required
        onChange={
          (event) =>
            onChange(
              event.target.value,
            )
        }
      >
        <option value="">
          Sélectionner
        </option>

        {
          options.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {
                  option.label
                }
              </option>
            ),
          )
        }
      </select>
    </label>
  );
}

function SubmitButton({
  editing,
}: {
  editing: boolean;
}) {
  return (
    <button
      className="primary-button"
      type="submit"
    >
      {
        editing
          ? 'Enregistrer les modifications'
          : 'Ajouter'
      }
    </button>
  );
}
