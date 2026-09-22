import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router';

import {
  api,
} from '../lib/api';

import './dashboard-premium.css';

type AnyItem = Record<string, any>;

type DashboardState = {
  etudiants: AnyItem[];
  enseignants: AnyItem[];
  inscriptions: AnyItem[];
  cours: AnyItem[];
  affectations: AnyItem[];
  seances: AnyItem[];
  eligibles: AnyItem[];
  nonEligibles: AnyItem[];
  diplomes: AnyItem[];
};

const emptyState: DashboardState = {
  etudiants: [],
  enseignants: [],
  inscriptions: [],
  cours: [],
  affectations: [],
  seances: [],
  eligibles: [],
  nonEligibles: [],
  diplomes: [],
};

function arrayValue(
  value: any,
): AnyItem[] {
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

function hours(
  item: AnyItem,
): number {
  const candidates = [
    item.dureeHeures,
    item.duree,
    item.nbHeures,
    item.nombreHeures,
    item.heures,
    item.volumeHoraire,
  ];

  for (const value of candidates) {
    const numberValue =
      Number(value);

    if (
      Number.isFinite(numberValue)
    ) {
      return numberValue;
    }
  }

  return 0;
}

function Icon({
  name,
}: {
  name:
    | 'students'
    | 'teacher'
    | 'file'
    | 'book'
    | 'chart'
    | 'calendar'
    | 'flash'
    | 'graduate'
    | 'medal'
    | 'activity'
    | 'clock'
    | 'check'
    | 'close'
    | 'minus'
    | 'refresh';
}) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (name === 'students') {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === 'teacher') {
    return (
      <svg {...common}>
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
        <path d="m16 11 2 2 4-4" />
      </svg>
    );
  }

  if (name === 'file') {
    return (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h6" />
      </svg>
    );
  }

  if (name === 'book') {
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }

  if (name === 'chart') {
    return (
      <svg {...common}>
        <path d="M3 3v18h18" />
        <path d="M7 16V9M12 16V5M17 16v-7" />
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </svg>
    );
  }

  if (name === 'flash') {
    return (
      <svg {...common}>
        <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
      </svg>
    );
  }

  if (name === 'graduate') {
    return (
      <svg {...common}>
        <path d="m2 10 10-5 10 5-10 5z" />
        <path d="M6 12v5c3 2 9 2 12 0v-5" />
      </svg>
    );
  }

  if (name === 'medal') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="6" />
        <path d="m8 14-2 8 6-3 6 3-2-8" />
      </svg>
    );
  }

  if (name === 'activity') {
    return (
      <svg {...common}>
        <path d="M3 12h4l2-7 4 14 2-7h6" />
      </svg>
    );
  }

  if (name === 'clock') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === 'check') {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === 'close') {
    return (
      <svg {...common}>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    );
  }

  if (name === 'minus') {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  icon,
  tone,
  onClick,
}: {
  label: string;
  value: string | number;
  icon:
    | 'students'
    | 'teacher'
    | 'file'
    | 'book';
  tone:
    | 'blue'
    | 'green'
    | 'purple'
    | 'orange';
  onClick: () => void;
}) {
  return (
    <button
      className="premium-kpi"
      type="button"
      onClick={onClick}
    >
      <span
        className={`premium-kpi-icon ${tone}`}
      >
        <Icon name={icon} />
      </span>

      <span className="premium-kpi-content">
        <span className="premium-kpi-label">
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <span className="premium-kpi-caption">
          Données actuelles
        </span>
      </span>

      <span className="premium-kpi-arrow">
        ›
      </span>
    </button>
  );
}

function SectionHeader({
  icon,
  title,
  action,
  onAction,
}: {
  icon:
    | 'chart'
    | 'calendar'
    | 'graduate'
    | 'medal'
    | 'activity'
    | 'flash';
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="premium-section-header">
      <div className="premium-section-heading">
        <span className="premium-section-icon">
          <Icon name={icon} />
        </span>

        <h2>
          {title}
        </h2>
      </div>

      {action && onAction && (
        <button
          className="premium-link-button"
          type="button"
          onClick={onAction}
        >
          {action}
          <span>→</span>
        </button>
      )}
    </div>
  );
}

export function DashboardPage() {
  const navigate =
    useNavigate();

  const [
    data,
    setData,
  ] =
    useState<DashboardState>(
      emptyState,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshedAt,
    setRefreshedAt,
  ] =
    useState<Date | null>(
      null,
    );

  const load =
    useCallback(
      async () => {
        setLoading(true);

        const results =
          await Promise.allSettled([
            api('/etudiants'),
            api('/enseignants'),
            api('/inscriptions'),
            api('/cours'),
            api('/affectations'),
            api('/seances'),
            api('/eligibilite/eligibles'),
            api('/eligibilite/non-eligibles'),
            api('/diplomes/demandes'),
          ]);

        const value =
          (index: number) =>
            results[index].status ===
            'fulfilled'
              ? arrayValue(
                  results[index].value,
                )
              : [];

        setData({
          etudiants: value(0),
          enseignants: value(1),
          inscriptions: value(2),
          cours: value(3),
          affectations: value(4),
          seances: value(5),
          eligibles: value(6),
          nonEligibles: value(7),
          diplomes: value(8),
        });

        setRefreshedAt(
          new Date(),
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

  const activeEtudiants =
    data.etudiants.filter(
      (item) =>
        item.actif !== false,
    ).length;

  const activeEnseignants =
    data.enseignants.filter(
      (item) =>
        item.actif !== false,
    ).length;

  const activeCours =
    data.cours.filter(
      (item) =>
        item.actif !== false,
    ).length;

  const validatedSessions =
    data.seances.filter(
      (item) =>
        item.statut ===
        'VALIDEE',
    );

  const pendingSessions =
    data.seances.filter(
      (item) =>
        item.statut ===
        'DECLAREE',
    );

  const rejectedSessions =
    data.seances.filter(
      (item) =>
        item.statut ===
        'REJETEE',
    );

  const cancelledSessions =
    data.seances.filter(
      (item) =>
        item.statut ===
        'ANNULEE',
    );

  const validatedHours =
    validatedSessions.reduce(
      (total, item) =>
        total +
        hours(item),
      0,
    );

  const plannedHours =
    data.affectations.reduce(
      (total, item) =>
        total +
        Number(
          item.cours
            ?.volumeHoraire ??
          item.volumeHoraire ??
          0,
        ),
      0,
    );

  const executionRate =
    plannedHours > 0
      ? Math.min(
          100,
          Math.round(
            (
              validatedHours /
              plannedHours
            ) *
              100,
          ),
        )
      : 0;

  const terminalFiles =
    data.eligibles.length +
    data.nonEligibles.length;

  const deliveredDiplomas =
    data.diplomes.filter(
      (item) =>
        item.statut ===
        'RETIREE',
    ).length;

  const pendingDiplomas =
    data.diplomes.filter(
      (item) =>
        [
          'DEMANDEE',
          'EN_VERIFICATION',
          'A_CORRIGER',
        ].includes(
          item.statut,
        ),
    ).length;

  const inProgressDiplomas =
    data.diplomes.filter(
      (item) =>
        [
          'VALIDEE',
          'GENEREE',
          'SIGNEE',
          'DISPONIBLE',
        ].includes(
          item.statut,
        ),
    ).length;

  return (
    <main className="premium-dashboard">
      <section className="premium-dashboard-heading">
        <div>
          <span className="premium-eyebrow">
            Pilotage académique
          </span>

          <h1>
            Tableau de bord
          </h1>

          <p>
            Vue consolidée du suivi académique
            et administratif.
          </p>
        </div>

        <div className="premium-heading-actions">
          <div className="premium-academic-year">
            <Icon name="calendar" />

            <div>
              <span>
                Année académique
              </span>

              <strong>
                2026 – 2027
              </strong>
            </div>
          </div>

          <button
            className="premium-refresh"
            type="button"
            disabled={loading}
            onClick={
              () => void load()
            }
          >
            <Icon name="refresh" />

            {loading
              ? 'Actualisation...'
              : 'Actualiser'}
          </button>
        </div>
      </section>

      <section className="premium-kpi-grid">
        <KpiCard
          label="Étudiants actifs"
          value={activeEtudiants}
          icon="students"
          tone="blue"
          onClick={
            () =>
              navigate(
                '/scolarite',
              )
          }
        />

        <KpiCard
          label="Enseignants actifs"
          value={activeEnseignants}
          icon="teacher"
          tone="green"
          onClick={
            () =>
              navigate(
                '/enseignements',
              )
          }
        />

        <KpiCard
          label="Inscriptions"
          value={
            data.inscriptions.length
          }
          icon="file"
          tone="purple"
          onClick={
            () =>
              navigate(
                '/scolarite',
              )
          }
        />

        <KpiCard
          label="Cours actifs"
          value={activeCours}
          icon="book"
          tone="orange"
          onClick={
            () =>
              navigate(
                '/referentiel',
              )
          }
        />
      </section>

      <section className="premium-middle-grid">
        <article className="premium-card premium-teaching-card">
          <SectionHeader
            icon="chart"
            title="Suivi des enseignements"
            action="Voir le détail"
            onAction={
              () =>
                navigate(
                  '/enseignements',
                )
            }
          />

          <div className="premium-teaching-metrics">
            <div className="premium-teaching-metric">
              <span className="premium-small-icon blue">
                <Icon name="students" />
              </span>

              <div>
                <span>
                  Affectations
                </span>

                <strong>
                  {data.affectations.length}
                </strong>
              </div>
            </div>

            <div className="premium-teaching-metric">
              <span className="premium-small-icon purple">
                <Icon name="clock" />
              </span>

              <div>
                <span>
                  Volume prévu
                </span>

                <strong>
                  {plannedHours} h
                </strong>
              </div>
            </div>

            <div className="premium-teaching-metric">
              <span className="premium-small-icon green">
                <Icon name="check" />
              </span>

              <div>
                <span>
                  Heures validées
                </span>

                <strong>
                  {validatedHours} h
                </strong>
              </div>
            </div>

            <div className="premium-teaching-metric">
              <span className="premium-small-icon neutral">
                <span
                  className="premium-mini-ring"
                  style={{
                    '--ring-value':
                      `${executionRate * 3.6}deg`,
                  } as React.CSSProperties}
                />
              </span>

              <div>
                <span>
                  Taux d’exécution
                </span>

                <strong>
                  {executionRate}%
                </strong>
              </div>
            </div>
          </div>

          <div className="premium-progress-row">
            <div className="premium-progress">
              <span
                style={{
                  width:
                    `${executionRate}%`,
                }}
              />
            </div>

            <strong>
              {executionRate}%
            </strong>
          </div>
        </article>

        <article className="premium-card">
          <SectionHeader
            icon="calendar"
            title="Séances"
            action="Voir le détail"
            onAction={
              () =>
                navigate(
                  '/pedagogie',
                )
            }
          />

          <div className="premium-status-list">
            <div className="premium-status-row">
              <span className="premium-status-icon orange">
                <Icon name="clock" />
              </span>

              <span>
                À valider
              </span>

              <strong>
                {pendingSessions.length}
              </strong>
            </div>

            <div className="premium-status-row">
              <span className="premium-status-icon green">
                <Icon name="check" />
              </span>

              <span>
                Validées
              </span>

              <strong>
                {validatedSessions.length}
              </strong>
            </div>

            <div className="premium-status-row">
              <span className="premium-status-icon red">
                <Icon name="close" />
              </span>

              <span>
                Rejetées
              </span>

              <strong>
                {rejectedSessions.length}
              </strong>
            </div>

            <div className="premium-status-row">
              <span className="premium-status-icon gray">
                <Icon name="minus" />
              </span>

              <span>
                Annulées
              </span>

              <strong>
                {cancelledSessions.length}
              </strong>
            </div>
          </div>
        </article>

        <article className="premium-card premium-quick-card">
          <SectionHeader
            icon="flash"
            title="Actions rapides"
          />

          <div className="premium-quick-actions">
            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    '/scolarite',
                  )
              }
            >
              <span className="premium-quick-icon blue">
                <Icon name="students" />
              </span>

              Nouvelle inscription

              <span>›</span>
            </button>

            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    '/referentiel',
                  )
              }
            >
              <span className="premium-quick-icon purple">
                <Icon name="book" />
              </span>

              Créer un enseignement

              <span>›</span>
            </button>

            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    '/enseignements',
                  )
              }
            >
              <span className="premium-quick-icon green">
                <Icon name="calendar" />
              </span>

              Planifier une séance

              <span>›</span>
            </button>

            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    '/utilisateurs',
                  )
              }
            >
              <span className="premium-quick-icon neutral">
                <Icon name="students" />
              </span>

              Gérer les utilisateurs

              <span>›</span>
            </button>
          </div>
        </article>
      </section>

      <section className="premium-bottom-grid">
        <article className="premium-card">
          <SectionHeader
            icon="graduate"
            title="Éligibilité aux diplômes"
            action="Voir le détail"
            onAction={
              () =>
                navigate(
                  '/diplomes',
                )
            }
          />

          <div className="premium-status-list compact">
            <div className="premium-status-row">
              <span className="premium-status-icon blue">
                <Icon name="file" />
              </span>

              <span>
                Dossiers terminaux
              </span>

              <strong>
                {terminalFiles}
              </strong>
            </div>

            <div className="premium-status-row">
              <span className="premium-status-icon green">
                <Icon name="check" />
              </span>

              <span>
                Éligibles
              </span>

              <strong>
                {data.eligibles.length}
              </strong>
            </div>

            <div className="premium-status-row">
              <span className="premium-status-icon red">
                <Icon name="close" />
              </span>

              <span>
                Non éligibles
              </span>

              <strong>
                {data.nonEligibles.length}
              </strong>
            </div>
          </div>
        </article>

        <article className="premium-card premium-diploma-card">
          <SectionHeader
            icon="medal"
            title="Diplômes"
            action="Voir le détail"
            onAction={
              () =>
                navigate(
                  '/diplomes',
                )
            }
          />

          <div className="premium-diploma-value">
            <div className="premium-diploma-ring">
              <strong>
                {data.diplomes.length}
              </strong>
            </div>

            <span>
              demandes enregistrées
            </span>
          </div>

          <div className="premium-diploma-badges">
            <span className="success">
              <i />
              {deliveredDiplomas} délivré(s)
            </span>

            <span className="info">
              <i />
              {inProgressDiplomas} en cours
            </span>

            <span className="warning">
              <i />
              {pendingDiplomas} en attente
            </span>
          </div>
        </article>

        <article className="premium-card premium-activity-card">
          <SectionHeader
            icon="activity"
            title="Activité récente"
            action="Voir tout"
            onAction={
              () =>
                navigate(
                  '/audit',
                )
            }
          />

          <div className="premium-empty-state">
            <span className="premium-empty-icon">
              <Icon name="file" />
            </span>

            <strong>
              Aucune activité récente
            </strong>

            <p>
              Les dernières actions importantes
              apparaîtront ici.
            </p>
          </div>
        </article>
      </section>

      <footer className="premium-dashboard-footer">
        <span>
          © 2026 Suivi Évaluation
        </span>

        <span>
          {refreshedAt
            ? `Dernière actualisation : ${refreshedAt.toLocaleTimeString(
                'fr-FR',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                },
              )}`
            : ''}
        </span>
      </footer>
    </main>
  );
}