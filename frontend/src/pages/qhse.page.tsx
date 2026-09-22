import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  api,
} from '../lib/api';

type Item =
  Record<string, any>;

type IconName =
  | 'shield'
  | 'search'
  | 'calendar'
  | 'info'
  | 'warning'
  | 'book'
  | 'clock'
  | 'chart'
  | 'refresh'
  | 'check'
  | 'close'
  | 'activity'
  | 'eye'
  | 'more';

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap:
      'round' as const,
    strokeLinejoin:
      'round' as const,
  };

  switch (name) {
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );

    case 'search':
      return (
        <svg {...common}>
          <circle
            cx="11"
            cy="11"
            r="7"
          />
          <path d="m20 20-4-4" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...common}>
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
          />
          <path d="M8 3v4M16 3v4M3 11h18" />
        </svg>
      );

    case 'info':
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      );

    case 'warning':
      return (
        <svg {...common}>
          <path d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      );

    case 'book':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
        </svg>
      );

    case 'refresh':
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-15-3M4 4v4h4" />
          <path d="M4 13a8 8 0 0 0 15 3M20 20v-4h-4" />
        </svg>
      );

    case 'check':
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="m8 12 3 3 5-6" />
        </svg>
      );

    case 'close':
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="m9 9 6 6M15 9l-6 6" />
        </svg>
      );

    case 'activity':
      return (
        <svg {...common}>
          <path d="M3 12h4l2-7 4 14 2-7h6" />
        </svg>
      );

    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle
            cx="12"
            cy="12"
            r="2.5"
          />
        </svg>
      );

    case 'more':
      return (
        <svg {...common}>
          <circle
            cx="5"
            cy="12"
            r="1"
            fill="currentColor"
          />
          <circle
            cx="12"
            cy="12"
            r="1"
            fill="currentColor"
          />
          <circle
            cx="19"
            cy="12"
            r="1"
            fill="currentColor"
          />
        </svg>
      );
  }
}

function arrayFrom(
  value: any,
): Item[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    Array.isArray(
      value?.data,
    )
  ) {
    return value.data;
  }

  if (
    Array.isArray(
      value?.items,
    )
  ) {
    return value.items;
  }

  if (
    Array.isArray(
      value?.alertes,
    )
  ) {
    return value.alertes;
  }

  return [];
}

function numberFrom(
  ...values: any[]
): number {
  for (const value of values) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      continue;
    }

    const converted =
      Number(value);

    if (
      Number.isFinite(
        converted,
      )
    ) {
      return converted;
    }
  }

  return 0;
}

function textFrom(
  ...values: any[]
): string {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim()
    ) {
      return String(value);
    }
  }

  return '';
}

function normalize(
  value: unknown,
): string {
  return String(
    value ?? '',
  )
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLowerCase()
    .trim();
}

function getAlertType(
  item: Item,
): string {
  return textFrom(
    item.type,
    item.typeAlerte,
    item.categorie,
    item.nature,
    item.code,
    'Autre',
  );
}

function classify(
  item: Item,
):
  | 'quality'
  | 'volume'
  | 'absence'
  | 'other' {
  const value =
    normalize(
      [
        getAlertType(
          item,
        ),
        item.description,
        item.message,
        item.titre,
      ].join(' '),
    );

  if (
    value.includes(
      'qualite',
    ) ||
    value.includes(
      'pedagog',
    ) ||
    value.includes(
      'rejete',
    )
  ) {
    return 'quality';
  }

  if (
    value.includes(
      'volume',
    ) ||
    value.includes(
      'horaire',
    ) ||
    value.includes(
      'depasse',
    ) ||
    value.includes(
      'incomplet',
    )
  ) {
    return 'volume';
  }

  if (
    value.includes(
      'absence',
    ) ||
    value.includes(
      'non demarrage',
    ) ||
    value.includes(
      'non-demarrage',
    ) ||
    value.includes(
      'non demarre',
    )
  ) {
    return 'absence';
  }

  return 'other';
}

function rawStatus(
  item: Item,
): string {
  return textFrom(
    item.statut,
    item.status,
    item.etat,
    'OUVERTE',
  );
}

function statusLabel(
  value: string,
): string {
  const status =
    normalize(value);

  if (
    status.includes(
      'resolu',
    ) ||
    status.includes(
      'ferme',
    ) ||
    status.includes(
      'cloture',
    )
  ) {
    return 'Résolue';
  }

  if (
    status.includes(
      'cours',
    )
  ) {
    return 'En cours';
  }

  return 'Ouverte';
}

function dateLabel(
  item: Item,
): string {
  const raw =
    item.date ??
    item.dateCreation ??
    item.createdAt ??
    item.updatedAt;

  if (!raw) {
    return '—';
  }

  const date =
    new Date(raw);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(raw);
  }

  return date.toLocaleDateString(
    'fr-FR',
  );
}

function teachingLabel(
  item: Item,
): string {
  return textFrom(
    item.enseignement,
    item.cours?.intitule,
    item.cours?.libelle,
    item.affectation?.cours?.intitule,
    item.affectation?.cours?.libelle,
    item.titreCours,
    '—',
  );
}

function classFormationLabel(
  item: Item,
): string {
  return textFrom(
    item.classeFormation,
    item.classe?.libelle,
    item.classe?.nom,
    item.formation?.nom,
    item.formation?.libelle,
    item.affectation?.classe?.libelle,
    '—',
  );
}

function descriptionLabel(
  item: Item,
): string {
  return textFrom(
    item.description,
    item.message,
    item.detail,
    item.titre,
    '—',
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
  tone:
    | 'red'
    | 'orange'
    | 'purple'
    | 'blue';
}) {
  return (
    <article className="qhse-kpi">
      <span
        className={
          `qhse-kpi-icon ${tone}`
        }
      >
        <Icon
          name={icon}
          size={23}
        />
      </span>

      <div className="qhse-kpi-content">
        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>
      </div>

      <span className="qhse-realtime">
        Temps réel
      </span>
    </article>
  );
}

function Indicator({
  value,
  label,
  icon,
  tone,
}: {
  value: string | number;
  label: string;
  icon: IconName;
  tone: string;
}) {
  return (
    <article className="qhse-indicator">
      <span
        className={
          `qhse-indicator-icon ${tone}`
        }
      >
        <Icon
          name={icon}
          size={19}
        />
      </span>

      <div>
        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>
      </div>
    </article>
  );
}

export function QhsePage() {
  const searchInput =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    dashboard,
    setDashboard,
  ] =
    useState<Item>(
      {},
    );

  const [
    alerts,
    setAlerts,
  ] =
    useState<Item[]>(
      [],
    );

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
    search,
    setSearch,
  ] =
    useState('');

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState('ALL');

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState('ALL');

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1);

  const [
    selected,
    setSelected,
  ] =
    useState<Item | null>(
      null,
    );

  const pageSize = 5;

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const [
            dashboardData,
            alertData,
          ] =
            await Promise.all([
              api<Item>(
                '/qhse/tableau-de-bord',
              ),

              api<any>(
                '/qhse/alertes',
              ),
            ]);

          setDashboard(
            dashboardData ??
              {},
          );

          setAlerts(
            arrayFrom(
              alertData,
            ),
          );
        }
        catch (
          currentError:
            unknown
        ) {
          setError(
            currentError instanceof
            Error
              ? currentError.message
              : 'Impossible de charger les informations QHSE.',
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
    [load],
  );

  useEffect(
    () => {
      const handleKey =
        (
          event:
            KeyboardEvent,
        ) => {
          if (
            event.ctrlKey &&
            event.key
              .toLowerCase() ===
              'k'
          ) {
            event.preventDefault();

            searchInput.current
              ?.focus();
          }
        };

      window.addEventListener(
        'keydown',
        handleKey,
      );

      return () => {
        window.removeEventListener(
          'keydown',
          handleKey,
        );
      };
    },
    [],
  );

  const indicators =
    dashboard.indicateurs ??
    dashboard.stats ??
    dashboard;

  const activeAlerts =
    numberFrom(
      indicators.alertesActives,
      indicators.nbAlertesActives,
      alerts.filter(
        (item) =>
          statusLabel(
            rawStatus(item),
          ) !==
          'Résolue',
      ).length,
    );

  const coursesNotStarted =
    numberFrom(
      indicators.coursNonDemarres,
      indicators.coursNonDémarrés,
      indicators.nbCoursNonDemarres,
    );

  const incompleteVolumes =
    numberFrom(
      indicators.volumesIncomplets,
      indicators.volumesHorairesIncomplets,
      indicators.nbVolumesIncomplets,
    );

  const overruns =
    numberFrom(
      indicators.depassements,
      indicators.depassementsVolumeHoraire,
      indicators.nbDepassements,
    );

  const rejectedSessions =
    numberFrom(
      indicators.seancesRejetees,
      indicators.nbSeancesRejetees,
    );

  const pendingSessions =
    numberFrom(
      indicators.seancesEnAttenteValidation,
      indicators.seancesEnAttente,
      indicators.nbSeancesEnAttente,
    );

  const correctiveActions =
    numberFrom(
      indicators.actionsCorrectives,
      indicators.actionsCorrectivesEnCours,
      alerts.filter(
        (item) =>
          statusLabel(
            rawStatus(item),
          ) ===
          'En cours',
      ).length,
    );

  const conformity =
    numberFrom(
      indicators.tauxConformite,
      indicators.tauxConformiteGlobal,
      indicators.conformite,
    );

  const academicYear =
    textFrom(
      dashboard.anneeAcademique,
      indicators.anneeAcademique,
      '2026-2027',
    );

  const categoryStats =
    useMemo(
      () => {
        const result = {
          quality: 0,
          volume: 0,
          absence: 0,
          other: 0,
        };

        alerts.forEach(
          (item) => {
            result[
              classify(item)
            ] += 1;
          },
        );

        return result;
      },
      [alerts],
    );

  const totalCategory =
    categoryStats.quality +
    categoryStats.volume +
    categoryStats.absence +
    categoryStats.other;

  function percent(
    value: number,
  ) {
    if (
      totalCategory ===
      0
    ) {
      return 0;
    }

    return Math.round(
      value /
        totalCategory *
        100,
    );
  }

  const qualityPercent =
    percent(
      categoryStats.quality,
    );

  const volumePercent =
    percent(
      categoryStats.volume,
    );

  const absencePercent =
    percent(
      categoryStats.absence,
    );

  const otherPercent =
    percent(
      categoryStats.other,
    );

  const donutBackground =
    totalCategory ===
    0
      ? '#edf2f7'
      : `conic-gradient(
          #ff3d63 0 ${qualityPercent}%,
          #ff9e2b ${qualityPercent}% ${qualityPercent + volumePercent}%,
          #9b4df0 ${qualityPercent + volumePercent}% ${qualityPercent + volumePercent + absencePercent}%,
          #2f80ed ${qualityPercent + volumePercent + absencePercent}% 100%
        )`;

  const typeOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            alerts
              .map(
                getAlertType,
              )
              .filter(
                Boolean,
              ),
          ),
        ),
      [alerts],
    );

  const statusOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            alerts.map(
              (item) =>
                statusLabel(
                  rawStatus(
                    item,
                  ),
                ),
            ),
          ),
        ),
      [alerts],
    );

  const filteredAlerts =
    useMemo(
      () => {
        const query =
          normalize(
            search,
          );

        return alerts.filter(
          (item) => {
            const type =
              getAlertType(
                item,
              );

            const status =
              statusLabel(
                rawStatus(
                  item,
                ),
              );

            const searchMatch =
              !query ||
              normalize(
                [
                  type,
                  teachingLabel(
                    item,
                  ),
                  classFormationLabel(
                    item,
                  ),
                  descriptionLabel(
                    item,
                  ),
                  status,
                ].join(' '),
              ).includes(
                query,
              );

            const typeMatch =
              typeFilter ===
                'ALL' ||
              type ===
                typeFilter;

            const statusMatch =
              statusFilter ===
                'ALL' ||
              status ===
                statusFilter;

            return (
              searchMatch &&
              typeMatch &&
              statusMatch
            );
          },
        );
      },
      [
        alerts,
        search,
        typeFilter,
        statusFilter,
      ],
    );

  useEffect(
    () => {
      setCurrentPage(1);
    },
    [
      search,
      typeFilter,
      statusFilter,
    ],
  );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredAlerts.length /
          pageSize,
      ),
    );

  const safePage =
    Math.min(
      currentPage,
      totalPages,
    );

  const visibleAlerts =
    filteredAlerts.slice(
      (
        safePage -
        1
      ) *
        pageSize,
      safePage *
        pageSize,
    );

  const firstItem =
    filteredAlerts.length ===
    0
      ? 0
      : (
          safePage -
          1
        ) *
          pageSize +
        1;

  const lastItem =
    Math.min(
      safePage *
        pageSize,
      filteredAlerts.length,
    );

  return (
    <main className="qhse-premium">

      <section className="qhse-toolbar">
        <div className="qhse-search">
          <Icon
            name="search"
            size={18}
          />

          <input
            ref={searchInput}
            value={search}
            onChange={
              (event) =>
                setSearch(
                  event.target.value,
                )
            }
            placeholder="Rechercher une alerte, un enseignement, une classe..."
          />

          <kbd>
            Ctrl + K
          </kbd>
        </div>

        <div className="qhse-year">
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

      <div className="qhse-breadcrumb">
        <span>
          Accueil
        </span>

        <span>
          ›
        </span>

        <strong>
          QHSE
        </strong>
      </div>

      <section className="qhse-heading">

        <div className="qhse-heading-main">
          <span className="qhse-heading-icon">
            <Icon
              name="shield"
              size={30}
            />
          </span>

          <div>
            <h1>
              QHSE
            </h1>

            <p>
              Contrôle indépendant de l'exécution des enseignements, anomalies et alertes qualité.
            </p>
          </div>
        </div>

        <aside className="qhse-info-card">
          <span>
            <Icon
              name="info"
              size={23}
            />
          </span>

          <div>
            <strong>
              Surveillez la conformité des enseignements.
            </strong>

            <p>
              Détectez les écarts, anticipez les risques et priorisez les actions correctives.
            </p>
          </div>

          <Icon
            name="shield"
            size={34}
          />
        </aside>

      </section>

      {error && (
        <div className="qhse-error">
          {error}
        </div>
      )}

      <section className="qhse-kpi-grid">

        <Kpi
          value={activeAlerts}
          label="Alertes actives"
          icon="warning"
          tone="red"
        />

        <Kpi
          value={coursesNotStarted}
          label="Cours non démarrés"
          icon="book"
          tone="orange"
        />

        <Kpi
          value={incompleteVolumes}
          label="Volumes incomplets"
          icon="clock"
          tone="purple"
        />

        <Kpi
          value={overruns}
          label="Dépassements volume horaire"
          icon="chart"
          tone="blue"
        />

      </section>

      <section className="qhse-overview">

        <article className="qhse-card qhse-indicators">

          <header className="qhse-card-header">
            <span className="qhse-card-icon">
              <Icon
                name="chart"
                size={22}
              />
            </span>

            <div>
              <h2>
                Indicateurs QHSE
              </h2>

              <p>
                Synthèse calculée à partir des enseignements et des séances validées.
              </p>
            </div>
          </header>

          <div className="qhse-indicator-grid">

            <Indicator
              value={activeAlerts}
              label="Alertes actives"
              icon="warning"
              tone="red"
            />

            <Indicator
              value={coursesNotStarted}
              label="Cours non démarrés"
              icon="book"
              tone="orange"
            />

            <Indicator
              value={incompleteVolumes}
              label="Volumes horaires incomplets"
              icon="clock"
              tone="purple"
            />

            <Indicator
              value={overruns}
              label="Dépassements volume horaire"
              icon="chart"
              tone="blue"
            />

            <Indicator
              value={rejectedSessions}
              label="Séances rejetées"
              icon="close"
              tone="blue"
            />

            <Indicator
              value={pendingSessions}
              label="Séances en attente validation"
              icon="clock"
              tone="red"
            />

            <Indicator
              value={`${conformity.toFixed(0)} %`}
              label="Taux de conformité global"
              icon="check"
              tone="green"
            />

            <Indicator
              value={correctiveActions}
              label="Actions correctives en cours"
              icon="activity"
              tone="red"
            />

          </div>

        </article>

        <article className="qhse-card qhse-distribution-card">

          <header className="qhse-card-header">
            <span className="qhse-card-icon">
              <Icon
                name="activity"
                size={22}
              />
            </span>

            <div>
              <h2>
                Répartition des alertes
              </h2>

              <p>
                Distribution par catégorie.
              </p>
            </div>
          </header>

          <div className="qhse-distribution">

            <div
              className="qhse-donut"
              style={{
                background:
                  donutBackground,
              }}
            >
              <div>
                <strong>
                  {alerts.length}
                </strong>

                <span>
                  alertes
                </span>
              </div>
            </div>

            <div className="qhse-legend">

              <div>
                <i className="red" />

                <span>
                  Qualité pédagogique
                </span>

                <strong>
                  {qualityPercent}%
                </strong>
              </div>

              <div>
                <i className="orange" />

                <span>
                  Volume horaire
                </span>

                <strong>
                  {volumePercent}%
                </strong>
              </div>

              <div>
                <i className="purple" />

                <span>
                  Absences / non démarrage
                </span>

                <strong>
                  {absencePercent}%
                </strong>
              </div>

              <div>
                <i className="blue" />

                <span>
                  Autres
                </span>

                <strong>
                  {otherPercent}%
                </strong>
              </div>

            </div>

          </div>

        </article>

      </section>

      <section className="qhse-card qhse-alerts">

        <header className="qhse-alert-header">

          <div className="qhse-alert-title">
            <span>
              <Icon
                name="warning"
                size={22}
              />
            </span>

            <div>
              <h2>
                Alertes de suivi
              </h2>

              <p>
                Anomalies nécessitant une surveillance ou une action corrective.
              </p>
            </div>
          </div>

          <div className="qhse-controls">

            <div className="qhse-alert-search">
              <Icon
                name="search"
                size={16}
              />

              <input
                value={search}
                onChange={
                  (event) =>
                    setSearch(
                      event.target.value,
                    )
                }
                placeholder="Rechercher une alerte..."
              />
            </div>

            <label>
              <span>
                Type d'alerte
              </span>

              <select
                value={typeFilter}
                onChange={
                  (event) =>
                    setTypeFilter(
                      event.target.value,
                    )
                }
              >
                <option value="ALL">
                  Toutes
                </option>

                {typeOptions.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>
                Statut
              </span>

              <select
                value={statusFilter}
                onChange={
                  (event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                }
              >
                <option value="ALL">
                  Tous
                </option>

                {statusOptions.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ),
                )}
              </select>
            </label>

            <button
              type="button"
              className="qhse-refresh"
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

        <div className="qhse-table-wrapper">

          <table className="qhse-table">

            <thead>
              <tr>
                <th>
                  Date
                </th>

                <th>
                  Type
                </th>

                <th>
                  Enseignement
                </th>

                <th>
                  Classe / Formation
                </th>

                <th>
                  Description
                </th>

                <th>
                  Statut
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {visibleAlerts.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="qhse-empty-cell"
                  >
                    <div className="qhse-empty-state">
                      <span>
                        <Icon
                          name="check"
                          size={27}
                        />
                      </span>

                      <strong>
                        Aucune alerte correspondant aux filtres
                      </strong>

                      <p>
                        Les anomalies détectées apparaîtront automatiquement ici.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleAlerts.map(
                  (
                    item,
                    index,
                  ) => {
                    const category =
                      classify(
                        item,
                      );

                    const status =
                      statusLabel(
                        rawStatus(
                          item,
                        ),
                      );

                    const statusClass =
                      normalize(
                        status,
                      ).replace(
                        /\s+/g,
                        '-',
                      );

                    return (
                      <tr
                        key={
                          item.id ??
                          `${safePage}-${index}`
                        }
                      >
                        <td>
                          {dateLabel(
                            item,
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              `qhse-type-badge ${category}`
                            }
                          >
                            <i />

                            {getAlertType(
                              item,
                            )}
                          </span>
                        </td>

                        <td>
                          {teachingLabel(
                            item,
                          )}
                        </td>

                        <td>
                          {classFormationLabel(
                            item,
                          )}
                        </td>

                        <td className="qhse-description">
                          {descriptionLabel(
                            item,
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              `qhse-status ${statusClass}`
                            }
                          >
                            <i />

                            {status}
                          </span>
                        </td>

                        <td>
                          <div className="qhse-row-actions">

                            <button
                              type="button"
                              className="qhse-view"
                              onClick={
                                () =>
                                  setSelected(
                                    item,
                                  )
                              }
                            >
                              <Icon
                                name="eye"
                                size={14}
                              />

                              Voir
                            </button>

                            <button
                              type="button"
                              className="qhse-more"
                              aria-label="Détails"
                              onClick={
                                () =>
                                  setSelected(
                                    item,
                                  )
                              }
                            >
                              <Icon
                                name="more"
                                size={17}
                              />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  },
                )
              )}

            </tbody>

          </table>

        </div>

        <footer className="qhse-pagination">

          <div>

            <button
              type="button"
              disabled={
                safePage ===
                1
              }
              onClick={
                () =>
                  setCurrentPage(
                    Math.max(
                      1,
                      safePage -
                        1,
                    ),
                  )
              }
            >
              ‹
            </button>

            {Array.from(
              {
                length:
                  Math.min(
                    totalPages,
                    5,
                  ),
              },
              (
                _,
                index,
              ) =>
                index +
                1,
            ).map(
              (
                pageNumber,
              ) => (
                <button
                  type="button"
                  key={
                    pageNumber
                  }
                  className={
                    safePage ===
                    pageNumber
                      ? 'active'
                      : ''
                  }
                  onClick={
                    () =>
                      setCurrentPage(
                        pageNumber,
                      )
                  }
                >
                  {pageNumber}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={
                safePage ===
                totalPages
              }
              onClick={
                () =>
                  setCurrentPage(
                    Math.min(
                      totalPages,
                      safePage +
                        1,
                    ),
                  )
              }
            >
              ›
            </button>

          </div>

          <span>
            {firstItem} - {lastItem} sur {filteredAlerts.length} alertes
          </span>

        </footer>

      </section>

      <footer className="qhse-tip">
        <Icon
          name="info"
          size={19}
        />

        <strong>
          Bon à savoir :
        </strong>

        <span>
          le module QHSE fournit une lecture indépendante de l'exécution pédagogique et aide à prioriser les écarts nécessitant une action corrective.
        </span>
      </footer>

      {selected && (
        <div
          className="qhse-modal-backdrop"
          onClick={
            () =>
              setSelected(
                null,
              )
          }
        >

          <article
            className="qhse-modal"
            onClick={
              (event) =>
                event.stopPropagation()
            }
          >

            <header>

              <div>
                <span>
                  <Icon
                    name="warning"
                    size={21}
                  />
                </span>

                <div>
                  <h3>
                    Détail de l'alerte
                  </h3>

                  <p>
                    Analyse QHSE
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  () =>
                    setSelected(
                      null,
                    )
                }
              >
                ×
              </button>

            </header>

            <div className="qhse-modal-grid">

              <div>
                <span>
                  Type
                </span>

                <strong>
                  {getAlertType(
                    selected,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Statut
                </span>

                <strong>
                  {statusLabel(
                    rawStatus(
                      selected,
                    ),
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Enseignement
                </span>

                <strong>
                  {teachingLabel(
                    selected,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Classe / Formation
                </span>

                <strong>
                  {classFormationLabel(
                    selected,
                  )}
                </strong>
              </div>

            </div>

            <section>
              <span>
                Description
              </span>

              <p>
                {descriptionLabel(
                  selected,
                )}
              </p>
            </section>

          </article>

        </div>
      )}

    </main>
  );
}

export default QhsePage;