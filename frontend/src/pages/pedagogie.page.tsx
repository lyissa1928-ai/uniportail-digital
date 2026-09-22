import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { api } from '../lib/api';

type Item = Record<string, any>;

type Perimetre =
  | 'affectation'
  | 'classe'
  | 'formation';

type IconName =
  | 'book'
  | 'calendar'
  | 'check'
  | 'close'
  | 'clock'
  | 'chart'
  | 'history'
  | 'search'
  | 'info'
  | 'refresh'
  | 'filter'
  | 'school'
  | 'file';

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'book':
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 11h18" />
        </svg>
      );

    case 'check':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      );

    case 'close':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m9 9 6 6M15 9l-6 6" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case 'chart':
      return (
        <svg {...props}>
          <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
        </svg>
      );

    case 'history':
      return (
        <svg {...props}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case 'search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case 'info':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      );

    case 'refresh':
      return (
        <svg {...props}>
          <path d="M20 11a8 8 0 0 0-15-3M4 4v4h4" />
          <path d="M4 13a8 8 0 0 0 15 3M20 20v-4h-4" />
        </svg>
      );

    case 'filter':
      return (
        <svg {...props}>
          <path d="M4 5h16M7 12h10M10 19h4" />
        </svg>
      );

    case 'school':
      return (
        <svg {...props}>
          <path d="m2 10 10-5 10 5-10 5z" />
          <path d="M6 12v5c3 2 9 2 12 0v-5" />
        </svg>
      );

    default:
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );
  }
}

function toArray(
  value: any,
): Item[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  return [];
}

function sessionHours(
  item: Item,
): number {
  return Number(
    item.dureeHeures ??
      item.duree ??
      item.nbHeures ??
      item.nombreHeures ??
      item.heures ??
      0,
  );
}

function courseName(
  item: Item,
): string {
  return (
    item.affectation?.cours?.intitule ??
    item.affectation?.cours?.libelle ??
    item.cours?.intitule ??
    item.cours?.libelle ??
    item.titre ??
    '—'
  );
}

function teacherName(
  item: Item,
): string {
  const teacher =
    item.affectation?.enseignant ??
    item.enseignant;

  if (!teacher) {
    return '—';
  }

  return (
    [
      teacher.prenom,
      teacher.nom,
    ]
      .filter(Boolean)
      .join(' ') ||
    teacher.matricule ||
    '—'
  );
}

function sessionDate(
  item: Item,
): string {
  const raw =
    item.dateSeance ??
    item.date ??
    item.dateValidation ??
    item.updatedAt ??
    item.createdAt;

  if (!raw) {
    return '—';
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return String(raw);
  }

  return date.toLocaleDateString(
    'fr-FR',
  );
}

function Kpi({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: IconName;
  tone: string;
}) {
  return (
    <article className="ped-kpi-card">
      <span
        className={`ped-kpi-icon ${tone}`}
      >
        <Icon
          name={icon}
          size={22}
        />
      </span>

      <div className="ped-kpi-content">
        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>
      </div>

      <span className="ped-live-badge">
        Temps réel
      </span>
    </article>
  );
}

export function PedagogiePage() {
  const searchRef =
    useRef<HTMLInputElement>(null);

  const [
    pending,
    setPending,
  ] = useState<Item[]>([]);

  const [
    sessions,
    setSessions,
  ] = useState<Item[]>([]);

  const [
    assignments,
    setAssignments,
  ] = useState<Item[]>([]);

  const [
    classes,
    setClasses,
  ] = useState<Item[]>([]);

  const [
    formations,
    setFormations,
  ] = useState<Item[]>([]);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    busyId,
    setBusyId,
  ] = useState<number | null>(
    null,
  );

  const [
    scope,
    setScope,
  ] = useState<Perimetre>(
    'affectation',
  );

  const [
    selectedId,
    setSelectedId,
  ] = useState('');

  const [
    analysis,
    setAnalysis,
  ] = useState<Item | null>(
    null,
  );

  const [
    analysisLoading,
    setAnalysisLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        const results =
          await Promise.allSettled([
            api(
              '/pedagogie/seances/en-attente',
            ),
            api('/seances'),
            api('/affectations'),
            api('/classes'),
            api('/formations'),
          ]);

        function result(
          index: number,
        ) {
          const current =
            results[index];

          return current.status ===
            'fulfilled'
            ? toArray(
                current.value,
              )
            : [];
        }

        setPending(
          result(0),
        );

        setSessions(
          result(1),
        );

        setAssignments(
          result(2),
        );

        setClasses(
          result(3),
        );

        setFormations(
          result(4),
        );

        setLoading(false);
      },
      [],
    );

  useEffect(
    () => {
      void load();
    },
    [load],
  );

  useEffect(
    () => {
      function shortcut(
        event: KeyboardEvent,
      ) {
        if (
          event.ctrlKey &&
          event.key.toLowerCase() ===
            'k'
        ) {
          event.preventDefault();

          searchRef.current?.focus();
        }
      }

      window.addEventListener(
        'keydown',
        shortcut,
      );

      return () =>
        window.removeEventListener(
          'keydown',
          shortcut,
        );
    },
    [],
  );

  const validated =
    useMemo(
      () =>
        sessions.filter(
          (item) =>
            item.statut ===
            'VALIDEE',
        ),
      [sessions],
    );

  const rejected =
    useMemo(
      () =>
        sessions.filter(
          (item) =>
            item.statut ===
            'REJETEE',
        ),
      [sessions],
    );

  const validatedHours =
    useMemo(
      () =>
        validated.reduce(
          (total, item) =>
            total +
            sessionHours(item),
          0,
        ),
      [validated],
    );

  const history =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return sessions
          .filter(
            (item) =>
              [
                'VALIDEE',
                'REJETEE',
                'ANNULEE',
              ].includes(
                item.statut,
              ),
          )
          .filter(
            (item) =>
              !query ||
              [
                courseName(item),
                teacherName(item),
                item.statut ?? '',
              ]
                .join(' ')
                .toLowerCase()
                .includes(query),
          );
      },
      [
        sessions,
        search,
      ],
    );

  const scopeItems =
    scope === 'classe'
      ? classes
      : scope === 'formation'
        ? formations
        : assignments;

  const academicYear =
    classes.find(
      (item) =>
        item.anneeAcademique,
    )?.anneeAcademique ??
    '2026-2027';

  function scopeLabel(
    item: Item,
  ): string {
    if (
      scope ===
      'affectation'
    ) {
      const course =
        item.cours?.intitule ??
        item.cours?.libelle ??
        `Affectation ${item.id}`;

      const teacher =
        [
          item.enseignant?.prenom,
          item.enseignant?.nom,
        ]
          .filter(Boolean)
          .join(' ');

      return teacher
        ? `${course} — ${teacher}`
        : course;
    }

    return (
      item.libelle ??
      item.nom ??
      item.code ??
      `#${item.id}`
    );
  }

  async function validateSession(
    id: number,
  ) {
    setBusyId(id);
    setError('');
    setSuccess('');

    try {
      await api(
        `/pedagogie/seances/${id}/valider`,
        {
          method: 'PATCH',
        },
      );

      setSuccess(
        'La séance a été validée.',
      );

      await load();
    }
    catch (currentError: unknown) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'Validation impossible.',
      );
    }
    finally {
      setBusyId(null);
    }
  }

  async function rejectSession(
    id: number,
  ) {
    const reason =
      window.prompt(
        'Motif du rejet :',
      );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setError(
        'Le motif du rejet est obligatoire.',
      );

      return;
    }

    setBusyId(id);
    setError('');
    setSuccess('');

    try {
      try {
        await api(
          `/pedagogie/seances/${id}/rejeter`,
          {
            method: 'PATCH',

            body:
              JSON.stringify({
                motifRejet:
                  reason.trim(),
              }),
          },
        );
      }
      catch {
        await api(
          `/pedagogie/seances/${id}/rejeter`,
          {
            method: 'PATCH',

            body:
              JSON.stringify({
                motif:
                  reason.trim(),
              }),
          },
        );
      }

      setSuccess(
        'La séance a été rejetée.',
      );

      await load();
    }
    catch (currentError: unknown) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'Rejet impossible.',
      );
    }
    finally {
      setBusyId(null);
    }
  }

  async function resetSession(
    id: number,
  ) {
    setBusyId(id);
    setError('');
    setSuccess('');

    try {
      await api(
        `/pedagogie/seances/${id}/remettre-en-attente`,
        {
          method: 'PATCH',
        },
      );

      setSuccess(
        'La séance a été remise en attente.',
      );

      await load();
    }
    catch (currentError: unknown) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'Opération impossible.',
      );
    }
    finally {
      setBusyId(null);
    }
  }

  async function runAnalysis() {
    if (!selectedId) {
      setError(
        'Sélectionnez un élément à analyser.',
      );

      return;
    }

    let endpoint = '';

    if (
      scope ===
      'affectation'
    ) {
      endpoint =
        `/pedagogie/affectations/${selectedId}/progression`;
    }

    if (
      scope ===
      'classe'
    ) {
      endpoint =
        `/pedagogie/classes/${selectedId}/suivi`;
    }

    if (
      scope ===
      'formation'
    ) {
      endpoint =
        `/pedagogie/formations/${selectedId}/suivi`;
    }

    setError('');
    setAnalysis(null);
    setAnalysisLoading(true);

    try {
      setAnalysis(
        await api<Item>(
          endpoint,
        ),
      );
    }
    catch (currentError: unknown) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'Analyse impossible.',
      );
    }
    finally {
      setAnalysisLoading(false);
    }
  }

  const expectedHours =
    Number(
      analysis?.volumePrevu ??
      analysis?.volumeHorairePrevu ??
      analysis?.heuresPrevues ??
      0,
    );

  const completedHours =
    Number(
      analysis?.heuresValidees ??
      analysis?.volumeRealise ??
      analysis?.heuresRealisees ??
      0,
    );

  const progress =
    Number(
      analysis?.tauxExecution ??
      analysis?.progression ??
      (
        expectedHours > 0
          ? completedHours /
            expectedHours *
            100
          : 0
      ),
    );

  return (
    <main className="pedagogie-premium">

      <section className="ped-toolbar">
        <div className="ped-search-box">
          <Icon
            name="search"
            size={18}
          />

          <input
            ref={searchRef}
            value={search}
            onChange={
              (event) =>
                setSearch(
                  event.target.value,
                )
            }
            placeholder="Rechercher une séance, un enseignement, une classe..."
          />

          <kbd>
            Ctrl + K
          </kbd>
        </div>

        <div className="ped-academic-year">
          <Icon
            name="calendar"
            size={18}
          />

          <div>
            <span>
              Année académique
            </span>

            <strong>
              {academicYear}
            </strong>
          </div>
        </div>
      </section>

      <div className="ped-breadcrumb">
        Accueil
        <span>›</span>
        Pédagogie
      </div>

      <section className="ped-page-heading">
        <div className="ped-main-title">
          <span className="ped-main-icon">
            <Icon
              name="book"
              size={27}
            />
          </span>

          <div>
            <h1>
              Pédagogie
            </h1>

            <p>
              Validation des séances, contrôle de réalisation et progression des enseignements.
            </p>
          </div>
        </div>

        <aside className="ped-info-card">
          <span>
            <Icon
              name="info"
              size={21}
            />
          </span>

          <div>
            <strong>
              Suivez et validez les séances pédagogiques
            </strong>

            <p>
              Seules les séances validées sont comptabilisées dans les heures officielles.
            </p>
          </div>

          <Icon
            name="school"
            size={31}
          />
        </aside>
      </section>

      {error && (
        <div className="ped-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="ped-message success">
          {success}
        </div>
      )}

      <section className="ped-kpi-grid">
        <Kpi
          label="Séances en attente"
          value={pending.length}
          icon="calendar"
          tone="purple"
        />

        <Kpi
          label="Séances validées"
          value={validated.length}
          icon="check"
          tone="green"
        />

        <Kpi
          label="Séances rejetées"
          value={rejected.length}
          icon="close"
          tone="red"
        />

        <Kpi
          label="Heures validées"
          value={`${validatedHours.toFixed(1)} h`}
          icon="clock"
          tone="blue"
        />
      </section>

      <section className="ped-panel">
        <header className="ped-panel-header">
          <div className="ped-panel-title">
            <span className="ped-panel-icon">
              <Icon
                name="clock"
                size={21}
              />
            </span>

            <div>
              <h2>
                Séances à valider
              </h2>

              <p>
                Seules les séances validées sont comptabilisées comme heures officiellement réalisées.
              </p>
            </div>
          </div>

          <div className="ped-panel-actions">
            <span className="ped-counter">
              {pending.length}
            </span>

            <button
              type="button"
              className="ped-icon-button"
              onClick={
                () =>
                  void load()
              }
            >
              <Icon
                name="refresh"
                size={17}
              />
            </button>

            <button
              type="button"
              className="ped-primary"
              disabled={loading}
              onClick={
                () =>
                  void load()
              }
            >
              <Icon
                name="refresh"
                size={16}
              />

              {loading
                ? 'Actualisation...'
                : 'Actualiser'}
            </button>
          </div>
        </header>

        {pending.length === 0 ? (
          <div className="ped-empty">
            <span>
              <Icon
                name="calendar"
                size={27}
              />
            </span>

            <strong>
              Aucune séance en attente
            </strong>

            <p>
              Les séances en attente de validation apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="ped-table-container">
            <table className="ped-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Enseignement</th>
                  <th>Enseignant</th>
                  <th>Durée</th>
                  <th>Contenu</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {pending.map(
                  (item) => (
                    <tr
                      key={item.id}
                    >
                      <td>
                        {sessionDate(
                          item,
                        )}
                      </td>

                      <td>
                        <strong>
                          {courseName(
                            item,
                          )}
                        </strong>
                      </td>

                      <td>
                        {teacherName(
                          item,
                        )}
                      </td>

                      <td>
                        {sessionHours(
                          item,
                        )} h
                      </td>

                      <td>
                        {item.contenu ??
                          item.description ??
                          item.observations ??
                          '—'}
                      </td>

                      <td>
                        <div className="ped-row-actions">
                          <button
                            type="button"
                            className="validate"
                            disabled={
                              busyId ===
                              item.id
                            }
                            onClick={
                              () =>
                                void validateSession(
                                  item.id,
                                )
                            }
                          >
                            Valider
                          </button>

                          <button
                            type="button"
                            className="reject"
                            disabled={
                              busyId ===
                              item.id
                            }
                            onClick={
                              () =>
                                void rejectSession(
                                  item.id,
                                )
                            }
                          >
                            Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="ped-panel">
        <header className="ped-panel-header">
          <div className="ped-panel-title">
            <span className="ped-panel-icon">
              <Icon
                name="chart"
                size={21}
              />
            </span>

            <div>
              <h2>
                Suivi de progression
              </h2>

              <p>
                Analyse par affectation, classe ou formation.
              </p>
            </div>
          </div>
        </header>

        <div className="ped-analysis-form">
          <label>
            <span>
              Périmètre
            </span>

            <div>
              <Icon
                name="filter"
                size={16}
              />

              <select
                value={scope}
                onChange={
                  (event) => {
                    setScope(
                      event.target
                        .value as
                        Perimetre,
                    );

                    setSelectedId('');
                    setAnalysis(null);
                  }
                }
              >
                <option value="affectation">
                  Affectation
                </option>

                <option value="classe">
                  Classe
                </option>

                <option value="formation">
                  Formation
                </option>
              </select>
            </div>
          </label>

          <label>
            <span>
              Élément
            </span>

            <div>
              <Icon
                name="school"
                size={16}
              />

              <select
                value={selectedId}
                onChange={
                  (event) =>
                    setSelectedId(
                      event.target.value,
                    )
                }
              >
                <option value="">
                  Sélectionner
                </option>

                {scopeItems.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {scopeLabel(
                        item,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>
          </label>

          <button
            type="button"
            className="ped-analyse"
            disabled={
              analysisLoading
            }
            onClick={
              () =>
                void runAnalysis()
            }
          >
            <Icon
              name="chart"
              size={17}
            />

            {analysisLoading
              ? 'Analyse...'
              : 'Analyser'}
          </button>
        </div>

        {analysis && (
          <div className="ped-analysis-result">
            <div>
              <span>
                Volume prévu
              </span>

              <strong>
                {expectedHours.toFixed(
                  1,
                )} h
              </strong>
            </div>

            <div>
              <span>
                Heures validées
              </span>

              <strong>
                {completedHours.toFixed(
                  1,
                )} h
              </strong>
            </div>

            <div>
              <span>
                Taux d'exécution
              </span>

              <strong>
                {progress.toFixed(
                  1,
                )} %
              </strong>
            </div>

            <div className="ped-progress">
              <span
                style={{
                  width:
                    `${Math.min(
                      100,
                      Math.max(
                        0,
                        progress,
                      ),
                    )}%`,
                }}
              />
            </div>
          </div>
        )}
      </section>

      <section className="ped-panel">
        <header className="ped-panel-header">
          <div className="ped-panel-title">
            <span className="ped-panel-icon">
              <Icon
                name="history"
                size={21}
              />
            </span>

            <div>
              <h2>
                Historique des décisions
              </h2>

              <p>
                Toutes les validations, rejets et annulations des séances.
              </p>
            </div>
          </div>
        </header>

        <div className="ped-table-container">
          <table className="ped-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Enseignement</th>
                <th>Enseignant</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="ped-history-empty"
                  >
                    <div>
                      <span>
                        <Icon
                          name="file"
                          size={23}
                        />
                      </span>

                      <strong>
                        Aucun historique disponible
                      </strong>

                      <p>
                        Les décisions pédagogiques apparaîtront ici.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map(
                  (item) => (
                    <tr
                      key={item.id}
                    >
                      <td>
                        {sessionDate(
                          item,
                        )}
                      </td>

                      <td>
                        {courseName(
                          item,
                        )}
                      </td>

                      <td>
                        {teacherName(
                          item,
                        )}
                      </td>

                      <td>
                        {sessionHours(
                          item,
                        )} h
                      </td>

                      <td>
                        <span
                          className={
                            `ped-status ${
                              String(
                                item.statut,
                              ).toLowerCase()
                            }`
                          }
                        >
                          {item.statut ===
                          'VALIDEE'
                            ? 'Validée'
                            : item.statut ===
                              'REJETEE'
                              ? 'Rejetée'
                              : item.statut ===
                                'ANNULEE'
                                ? 'Annulée'
                                : item.statut}
                        </span>
                      </td>

                      <td>
                        {[
                          'VALIDEE',
                          'REJETEE',
                        ].includes(
                          item.statut,
                        ) ? (
                          <button
                            type="button"
                            className="ped-secondary"
                            disabled={
                              busyId ===
                              item.id
                            }
                            onClick={
                              () =>
                                void resetSession(
                                  item.id,
                                )
                            }
                          >
                            Remettre en attente
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="ped-tip">
        <span>
          <Icon
            name="info"
            size={18}
          />
        </span>

        <strong>
          Bon à savoir :
        </strong>

        les séances validées alimentent automatiquement le suivi des heures et la progression des enseignements.
      </footer>

    </main>
  );
}

export default PedagogiePage;