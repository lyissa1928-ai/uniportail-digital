import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  Link,
} from 'react-router';

import {
  api,
} from '../lib/api';

import './home.page.css';

type PublicBranding = {
  appName: string;
  appSubtitle: string;
  heroTitle: string;
  heroDescription: string;
  quoteText: string;
  logoUrl: string;
  heroImageUrl: string;
};

type PublicActualite = {
  id: number;
  titre: string;
  resume: string;
  contenu?: string | null;
  imageUrl?: string | null;
  source:
    | 'PEDAGOGIE'
    | 'SCOLARITE'
    | 'ADMINISTRATION';
  dateDebut: string;
  dateFin: string;
  auteur?: {
    nomAffichage?: string | null;
  };
};

type PublicDiplomeDossier = {
  inscriptionId: number;
  anneeAcademique: string;
  formation: string;
  niveau: string;
  statut: string;
  disponible: boolean;
  retire: boolean;
  peutDemander: boolean;
  numeroDiplome?: string | null;
  dateDisponibilite?: string | null;
  dateRetrait?: string | null;
};

type PublicDiplomeResult = {
  matricule: string;
  dossiers: PublicDiplomeDossier[];
};

type IconName =
  | 'graduate'
  | 'users'
  | 'file'
  | 'chart'
  | 'shield'
  | 'screen'
  | 'search'
  | 'user'
  | 'play'
  | 'arrow'
  | 'building'
  | 'teacher'
  | 'settings'
  | 'book'
  | 'layers'
  | 'clock'
  | 'sparkles';

const DEFAULT_BRANDING: PublicBranding = {
  appName:
    'UniPortail Digital',
  appSubtitle:
    'Suivi & Évaluation Académique',
  heroTitle:
    'Un suivi rigoureux pour une réussite durable',
  heroDescription:
    'UniPortail Digital centralise la gestion des enseignements, des évaluations, de la scolarité et des diplômes dans une interface unique, sécurisée et collaborative.',
  quoteText:
    'L’éducation est la clé qui ouvre les portes d’un avenir meilleur.',
  logoUrl:
    '/images/uniportail-logo.webp',
  heroImageUrl:
    '/images/login-campus.webp',
};

function Icon({
  name,
}: {
  name:
    IconName;
}) {
  const common = {
    viewBox:
      '0 0 24 24',
    fill:
      'none',
    stroke:
      'currentColor',
    strokeWidth:
      1.8,
    strokeLinecap:
      'round' as const,
    strokeLinejoin:
      'round' as const,
    'aria-hidden':
      true,
  };

  const icons:
    Record<
      IconName,
      ReactNode
    > = {
      graduate: (
        <>
          <path d="m2 9 10-5 10 5-10 5z" />
          <path d="M6 11v5c3 2 9 2 12 0v-5" />
        </>
      ),

      users: (
        <>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 20v-1.5A5.5 5.5 0 0 1 9 13a5.5 5.5 0 0 1 5.5 5.5V20" />
          <path d="M15 14a4.5 4.5 0 0 1 6 4.2V20" />
        </>
      ),

      file: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8M8 17h6" />
        </>
      ),

      chart: (
        <>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </>
      ),

      shield: (
        <>
          <path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </>
      ),

      screen: (
        <>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </>
      ),

      search: (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </>
      ),

      user: (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </>
      ),

      play: (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m10 8 6 4-6 4z" />
        </>
      ),

      arrow: (
        <>
          <path d="M5 12h14" />
          <path d="m14 7 5 5-5 5" />
        </>
      ),

      building: (
        <>
          <path d="M3 21h18" />
          <path d="M5 21V9l7-4 7 4v12" />
          <path d="M9 21v-6h6v6M9 11h.01M15 11h.01" />
        </>
      ),

      teacher: (
        <>
          <rect x="8" y="3" width="13" height="10" rx="2" />
          <circle cx="5" cy="9" r="2.5" />
          <path d="M2 20v-3a3 3 0 0 1 6 0v3M11 7h6M11 10h4" />
        </>
      ),

      settings: (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1v.1H9.6V21a1.7 1.7 0 0 0-.4-1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 3.8 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H2.1V9.6h.1a1.7 1.7 0 0 0 1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.2 3.8a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1h4a1.7 1.7 0 0 0 .4 1 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.2a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1 .4h.1v4h-.1a1.7 1.7 0 0 0-1 .4 1.7 1.7 0 0 0-.6 1z" />
        </>
      ),

      book: (
        <>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
        </>
      ),

      layers: (
        <>
          <path d="m12 2 9 5-9 5-9-5z" />
          <path d="m3 12 9 5 9-5" />
          <path d="m3 17 9 5 9-5" />
        </>
      ),

      clock: (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      ),

      sparkles: (
        <>
          <path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2z" />
          <path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
        </>
      ),
    };

  return (
    <svg {...common}>
      {icons[name]}
    </svg>
  );
}

const moduleCards = [
  {
    icon:
      'graduate' as const,
    tone:
      'blue',
    title:
      'Suivi pédagogique',
    text:
      'Planification, enseignements, évaluations, soutenances',
  },

  {
    icon:
      'users' as const,
    tone:
      'green',
    title:
      'Scolarité',
    text:
      'Inscriptions, parcours, résultats, statistiques',
  },

  {
    icon:
      'file' as const,
    tone:
      'purple',
    title:
      'Diplômes',
    text:
      'Éligibilité, génération et délivrance',
  },

  {
    icon:
      'chart' as const,
    tone:
      'orange',
    title:
      'Pilotage & rapports',
    text:
      'Tableaux de bord, indicateurs, prise de décision',
  },
];

const audiences = [
  {
    icon:
      'users' as const,
    tone:
      'blue',
    title:
      'Étudiants',
    text:
      'Suivez votre parcours',
  },

  {
    icon:
      'teacher' as const,
    tone:
      'green',
    title:
      'Enseignants',
    text:
      'Gérez vos enseignements',
  },

  {
    icon:
      'settings' as const,
    tone:
      'purple',
    title:
      'Administratifs',
    text:
      'Simplifiez vos processus',
  },

  {
    icon:
      'building' as const,
    tone:
      'red',
    title:
      'Direction',
    text:
      'Pilotez avec des indicateurs',
  },
];

const partners = [
  {
    sigle:
      'UNI',
    nom:
      'Université partenaire',
  },

  {
    sigle:
      'ESP',
    nom:
      'École supérieure',
  },

  {
    sigle:
      'ISE',
    nom:
      'Institut supérieur',
  },

  {
    sigle:
      'CEF',
    nom:
      'Centre de formation',
  },
];

function HeroTitle({
  value,
}: {
  value:
    string;
}) {
  const normalized =
    value
      .trim()
      .toLocaleLowerCase(
        'fr-FR',
      );

  if (
    normalized ===
    'un suivi rigoureux pour une réussite durable'
  ) {
    return (
      <>
        Un suivi rigoureux
        <br />
        pour une{' '}
        <em>
          réussite durable
        </em>
      </>
    );
  }

  const marker =
    'réussite durable';

  const index =
    normalized
      .indexOf(
        marker,
      );

  if (
    index <
    0
  ) {
    return (
      <>
        {value}
      </>
    );
  }

  return (
    <>
      {value
        .slice(
          0,
          index,
        )
        .trim()}
      {' '}
      <em>
        {value.slice(
          index,
        )}
      </em>
    </>
  );
}

function actualiteSourceLabel(
  source:
    PublicActualite['source'],
) {
  if (
    source ===
    'PEDAGOGIE'
  ) {
    return 'Pédagogie';
  }

  if (
    source ===
    'SCOLARITE'
  ) {
    return 'Scolarité';
  }

  return 'Administration';
}

function diplomeStatusLabel(
  statut:
    string,
) {
  const labels:
    Record<
      string,
      string
    > = {
      DEMANDE_POSSIBLE:
        'Demande possible',
      NON_ELIGIBLE:
        'Pas encore éligible',
      DEMANDEE:
        'Demande reçue',
      EN_VERIFICATION:
        'En vérification',
      A_CORRIGER:
        'Correction demandée',
      VALIDEE:
        'Demande validée',
      REJETEE:
        'Demande rejetée',
      GENEREE:
        'Diplôme généré',
      SIGNEE:
        'Diplôme signé',
      DISPONIBLE:
        'Diplôme disponible',
      RETIREE:
        'Diplôme retiré',
      ANNULEE:
        'Demande annulée',
    };

  return (
    labels[statut] ??
    statut
  );
}

function actualiteDate(
  value:
    string,
) {
  const date =
    new Date(
      value,
    );

  return date
    .toLocaleDateString(
      'fr-FR',
      {
        day:
          '2-digit',
        month:
          'short',
        year:
          'numeric',
      },
    );
}

export function HomePage() {
  const [
    branding,
    setBranding,
  ] =
    useState<PublicBranding>(
      DEFAULT_BRANDING,
    );

  const [
    actualites,
    setActualites,
  ] =
    useState<PublicActualite[]>(
      [],
    );

  const [
    diplomeMatricule,
    setDiplomeMatricule,
  ] =
    useState('');

  const [
    diplomeEmail,
    setDiplomeEmail,
  ] =
    useState('');

  const [
    diplomeResult,
    setDiplomeResult,
  ] =
    useState<PublicDiplomeResult | null>(
      null,
    );

  const [
    diplomeBusy,
    setDiplomeBusy,
  ] =
    useState(false);

  const [
    diplomeError,
    setDiplomeError,
  ] =
    useState('');

  const [
    diplomeMessage,
    setDiplomeMessage,
  ] =
    useState('');

  useEffect(
    () => {
      let mounted =
        true;

      void api<PublicBranding>(
        '/branding/public',
      )
        .then(
          (result) => {
            if (
              mounted
            ) {
              setBranding(
                result,
              );
            }
          },
        )
        .catch(
          () => {
            if (
              mounted
            ) {
              setBranding(
                DEFAULT_BRANDING,
              );
            }
          },
        );

      return () => {
        mounted =
          false;
      };
    },
    [],
  );

  useEffect(
    () => {
      let mounted =
        true;

      void api<PublicActualite[]>(
        '/actualites/public?limit=3',
      )
        .then(
          (result) => {
            if (
              mounted
            ) {
              setActualites(
                Array.isArray(
                  result,
                )
                  ? result
                  : [],
              );
            }
          },
        )
        .catch(
          () => {
            if (
              mounted
            ) {
              setActualites([]);
            }
          },
        );

      return () => {
        mounted =
          false;
      };
    },
    [],
  );

  async function verifierDiplomePublic(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setDiplomeBusy(true);
    setDiplomeError('');
    setDiplomeMessage('');

    try {
      const result =
        await api<PublicDiplomeResult>(
          '/diplomes/public/verifier',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                matricule:
                  diplomeMatricule
                    .trim(),

                email:
                  diplomeEmail
                    .trim(),
              }),
          },
        );

      setDiplomeResult(
        result,
      );
    }
    catch (error) {
      setDiplomeResult(
        null,
      );

      setDiplomeError(
        error instanceof Error
          ? error.message
          : 'Vérification impossible.',
      );
    }
    finally {
      setDiplomeBusy(false);
    }
  }

  async function demanderDiplomePublic(
    inscriptionId:
      number,
  ) {
    setDiplomeBusy(true);
    setDiplomeError('');
    setDiplomeMessage('');

    try {
      const result =
        await api<PublicDiplomeResult>(
          '/diplomes/public/demander',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                matricule:
                  diplomeMatricule
                    .trim(),

                email:
                  diplomeEmail
                    .trim(),

                inscriptionId,
              }),
          },
        );

      setDiplomeResult(
        result,
      );

      setDiplomeMessage(
        'Votre demande de diplôme a bien été enregistrée.',
      );
    }
    catch (error) {
      setDiplomeError(
        error instanceof Error
          ? error.message
          : 'Demande impossible.',
      );
    }
    finally {
      setDiplomeBusy(false);
    }
  }

  return (
    <main className="public-home">
      <header className="public-nav">
        <Link
          to="/"
          className="public-brand"
          aria-label="Accueil UniPortail Digital"
        >
          <img
            src={
              branding.logoUrl
            }
            alt={
              branding.appName
            }
          />
        </Link>

        <nav
          className="public-nav-links"
          aria-label="Navigation publique"
        >
          <a
            className="active"
            href="#accueil"
          >
            Accueil
          </a>

          <a href="#apropos">
            À propos
          </a>

          <a href="#fonctionnalites">
            Fonctionnalités
          </a>

          <a href="#etablissements">
            Établissements
          </a>

          <a href="#actualites">
            Actualités
          </a>

          <a href="#contact">
            Contact
          </a>
        </nav>

        <div className="public-nav-actions">
          <button
            type="button"
            className="public-search-button"
            aria-label="Rechercher"
          >
            <Icon
              name="search"
            />
          </button>

          <Link
            to="/login"
            className="public-login-button"
          >
            <Icon
              name="user"
            />

            <span>
              Se connecter
            </span>
          </Link>
        </div>
      </header>

      <section
        id="accueil"
        className="public-hero"
      >
        <div
          className="public-hero-image"
          style={{
            backgroundImage:
              `url("${branding.heroImageUrl}")`,
          }}
        />

        <div className="public-hero-overlay" />

        <div className="public-hero-copy">
          <div className="public-hero-kicker">
            Plateforme académique intégrée
          </div>

          <h1>
            <HeroTitle
              value={
                branding.heroTitle
              }
            />
          </h1>

          <p>
            {
              branding.heroDescription
            }
          </p>

          <div className="public-hero-actions">
            <Link
              to="/login"
              className="public-primary-cta"
            >
              <Icon
                name="graduate"
              />

              <span>
                Accéder à mon espace
              </span>

              <Icon
                name="arrow"
              />
            </Link>

            <a
              href="#fonctionnalites"
              className="public-secondary-cta"
            >
              <Icon
                name="play"
              />

              <span>
                Découvrir la plateforme
              </span>
            </a>
          </div>

          <div className="public-trust-row">
            <span>
              <Icon
                name="shield"
              />
              Données sécurisées
            </span>

            <span>
              <Icon
                name="users"
              />
              Accessible à tous les acteurs
            </span>

            <span>
              <Icon
                name="screen"
              />
              Partout, à tout moment
            </span>
          </div>
        </div>

        <blockquote className="public-hero-quote">
          <span>
            “
          </span>

          <p>
            {
              branding.quoteText
            }
          </p>
        </blockquote>
      </section>

      <section
        id="fonctionnalites"
        className="public-modules-wrap"
      >
        <div className="public-module-grid">
          {
            moduleCards.map(
              (item) => (
                <article
                  className="public-module-card"
                  key={
                    item.title
                  }
                >
                  <span
                    className={
                      `public-module-icon ${item.tone}`
                    }
                  >
                    <Icon
                      name={
                        item.icon
                      }
                    />
                  </span>

                  <div>
                    <h2>
                      {
                        item.title
                      }
                    </h2>

                    <p>
                      {
                        item.text
                      }
                    </p>

                    <a href="#apropos">
                      En savoir plus
                      <span>
                        →
                      </span>
                    </a>
                  </div>
                </article>
              ),
            )
          }
        </div>
      </section>

      <section
        className="public-community"
      >
        <div className="public-community-copy">
          <span className="public-section-kicker">
            Au service de l’enseignement
          </span>

          <h2>
            Une plateforme pour tous
            <br />
            les acteurs de la communauté académique
          </h2>

          <p>
            Étudiants, enseignants, personnels administratifs
            et direction : UniPortail Digital facilite la
            collaboration et améliore la qualité du suivi
            académique.
          </p>
        </div>

        <div className="public-audience-grid">
          {
            audiences.map(
              (item) => (
                <article
                  className="public-audience"
                  key={
                    item.title
                  }
                >
                  <span
                    className={
                      `public-audience-icon ${item.tone}`
                    }
                  >
                    <Icon
                      name={
                        item.icon
                      }
                    />
                  </span>

                  <strong>
                    {
                      item.title
                    }
                  </strong>

                  <p>
                    {
                      item.text
                    }
                  </p>
                </article>
              ),
            )
          }
        </div>
      </section>

      <section
        className="public-showcase"
      >
        <article
          id="apropos"
          className="public-about-card"
        >
          <div className="public-about-copy">
            <span className="public-card-accent" />

            <h2>
              À propos de UniPortail Digital
            </h2>

            <p>
              Une solution moderne et évolutive, conçue pour accompagner les établissements d’enseignement supérieur dans leur transformation digitale.
            </p>

            <a
              href="#fonctionnalites"
              className="public-about-button"
            >
              En savoir plus
              <Icon
                name="arrow"
              />
            </a>
          </div>

          <div className="public-about-visual">
            <span className="public-about-badge">
              <Icon
                name="sparkles"
              />

              <strong>
                Réussite
                <br />
                ensemble
              </strong>
            </span>

            <span className="public-about-wave public-about-wave-one" />
            <span className="public-about-wave public-about-wave-two" />

            <div className="public-about-portrait">
              <Icon
                name="graduate"
              />
            </div>

            <em>
              Construire
              <br />
              l’avenir ensemble
            </em>
          </div>
        </article>

        <article
          id="actualites"
          className="public-news-panel"
        >
          <header className="public-panel-heading">
            <h2>
              Actualités
            </h2>

            <a href="#actualites">
              Voir toutes
              <span>
                →
              </span>
            </a>
          </header>

          <div className="public-news-list">
            {
              actualites.length ===
              0
                ? (
                  <div className="public-news-empty">
                    <Icon
                      name="clock"
                    />

                    <span>
                      Aucune actualité en cours
                    </span>
                  </div>
                )
                : actualites.map(
                    (item) => (
                      <article
                        className="public-news-row"
                        key={
                          item.id
                        }
                      >
                        <div className="public-news-thumb">
                          {
                            item.imageUrl
                              ? (
                                <img
                                  src={
                                    item.imageUrl
                                  }
                                  alt=""
                                />
                              )
                              : (
                                <span>
                                  <Icon
                                    name="file"
                                  />
                                </span>
                              )
                          }
                        </div>

                        <div className="public-news-row-copy">
                          <small>
                            {
                              actualiteDate(
                                item.dateDebut,
                              )
                            }
                          </small>

                          <strong>
                            {
                              item.titre
                            }
                          </strong>

                          <span>
                            {
                              actualiteSourceLabel(
                                item.source,
                              )
                            }
                          </span>
                        </div>
                      </article>
                    ),
                  )
            }
          </div>
        </article>

        <article
          id="etablissements"
          className="public-partners-panel"
        >
          <header className="public-panel-heading">
            <h2>
              Ils nous font confiance
            </h2>
          </header>

          <div className="public-partners-grid">
            {
              partners.map(
                (partner) => (
                  <article
                    className="public-partner-card"
                    key={
                      partner.sigle
                    }
                  >
                    <span>
                      {
                        partner.sigle
                      }
                    </span>

                    <div>
                      <strong>
                        {
                          partner.sigle
                        }
                      </strong>

                      <small>
                        {
                          partner.nom
                        }
                      </small>
                    </div>
                  </article>
                ),
              )
            }
          </div>

          <div className="public-partner-dots">
            <span>
              ←
            </span>

            <i className="active" />
            <i />
            <i />
            <i />

            <span>
              →
            </span>
          </div>
        </article>
      </section>

      <section
        id="diplomes-public"
        className="public-diploma-check"
      >
        <div className="public-diploma-intro">
          <span className="public-section-kicker">
            Service en ligne
          </span>

          <h2>
            Vérifier la disponibilité de votre diplôme
          </h2>

          <p>
            Saisissez votre matricule et l’adresse e-mail enregistrée dans votre dossier. Si votre diplôme n’est pas encore demandé mais que votre dossier est éligible, vous pourrez effectuer la demande directement ici.
          </p>

          <div className="public-diploma-security">
            <Icon
              name="shield"
            />

            <span>
              Vérification sécurisée par matricule et adresse e-mail.
            </span>
          </div>
        </div>

        <div className="public-diploma-card">
          <form
            className="public-diploma-form"
            onSubmit={
              verifierDiplomePublic
            }
          >
            <label>
              Matricule
              <input
                required
                value={
                  diplomeMatricule
                }
                onChange={
                  (event) =>
                    setDiplomeMatricule(
                      event.target
                        .value,
                    )
                }
                placeholder="Votre matricule étudiant"
              />
            </label>

            <label>
              Adresse e-mail
              <input
                required
                type="email"
                value={
                  diplomeEmail
                }
                onChange={
                  (event) =>
                    setDiplomeEmail(
                      event.target
                        .value,
                    )
                }
                placeholder="Adresse liée à votre dossier"
              />
            </label>

            <button
              type="submit"
              disabled={
                diplomeBusy
              }
            >
              <Icon
                name="search"
              />

              {diplomeBusy
                ? 'Vérification...'
                : 'Vérifier mon diplôme'}
            </button>
          </form>

          {diplomeError && (
            <div className="public-diploma-message error">
              {diplomeError}
            </div>
          )}

          {diplomeMessage && (
            <div className="public-diploma-message success">
              {diplomeMessage}
            </div>
          )}

          {diplomeResult && (
            <div className="public-diploma-results">
              {diplomeResult
                .dossiers
                .length ===
              0 ? (
                <div className="public-diploma-empty">
                  Aucun dossier de diplôme terminal n’est encore disponible pour ce matricule.
                </div>
              ) : (
                diplomeResult
                  .dossiers
                  .map(
                    (dossier) => (
                      <article
                        className="public-diploma-result"
                        key={
                          dossier
                            .inscriptionId
                        }
                      >
                        <div className="public-diploma-result-copy">
                          <span>
                            {
                              dossier
                                .anneeAcademique
                            }
                          </span>

                          <strong>
                            {
                              dossier
                                .formation
                            }
                          </strong>

                          <small>
                            {
                              dossier
                                .niveau
                            }
                          </small>
                        </div>

                        <div className="public-diploma-result-status">
                          <span
                            className={
                              dossier
                                .disponible
                                ? 'available'
                                : dossier
                                    .peutDemander
                                  ? 'requestable'
                                  : 'processing'
                            }
                          >
                            {
                              diplomeStatusLabel(
                                dossier
                                  .statut,
                              )
                            }
                          </span>

                          {dossier
                            .numeroDiplome && (
                            <small>
                              N° {
                                dossier
                                  .numeroDiplome
                              }
                            </small>
                          )}

                          {dossier
                            .peutDemander && (
                            <button
                              type="button"
                              disabled={
                                diplomeBusy
                              }
                              onClick={
                                () =>
                                  void demanderDiplomePublic(
                                    dossier
                                      .inscriptionId,
                                  )
                              }
                            >
                              Demander mon diplôme
                            </button>
                          )}
                        </div>
                      </article>
                    ),
                  )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="public-metrics">
        <article>
          <span className="public-metric-icon">
            <Icon
              name="layers"
            />
          </span>

          <div>
            <strong>
              7
            </strong>

            <small>
              Modules intégrés
            </small>
          </div>
        </article>

        <article>
          <span className="public-metric-icon">
            <Icon
              name="users"
            />
          </span>

          <div>
            <strong>
              Multi-profils
            </strong>

            <small>
              Étudiants, enseignants et administration
            </small>
          </div>
        </article>

        <article>
          <span className="public-metric-icon">
            <Icon
              name="chart"
            />
          </span>

          <div>
            <strong>
              Centralisé
            </strong>

            <small>
              Suivi, indicateurs et reporting
            </small>
          </div>
        </article>

        <article>
          <span className="public-metric-icon">
            <Icon
              name="shield"
            />
          </span>

          <div>
            <strong>
              Sécurisé
            </strong>

            <small>
              Accès contrôlé par rôles
            </small>
          </div>
        </article>

        <div
          className="public-metric-photo"
          style={{
            backgroundImage:
              `url("${branding.heroImageUrl}")`,
          }}
        >
          <span>
            L’excellence académique
            <br />
            à portée de main
          </span>
        </div>
      </section>

      <footer
        id="contact"
        className="public-footer"
      >
        <div className="public-footer-main">
          <div className="public-footer-brand">
            <img
              src={
                branding.logoUrl
              }
              alt={
                branding.appName
              }
            />
          </div>

          <nav>
            <a href="#accueil">
              Accueil
            </a>

            <a href="#apropos">
              À propos
            </a>

            <a href="#fonctionnalites">
              Fonctionnalités
            </a>

            <a href="#etablissements">
              Établissements
            </a>

            <a href="#actualites">
              Actualités
            </a>

            <a href="#contact">
              Contact
            </a>
          </nav>

          <div className="public-footer-social">
            <span>
              in
            </span>

            <span>
              𝕏
            </span>

            <span>
              ▶
            </span>

            <i />

            <p>
              Former aujourd’hui,
              <br />
              bâtir demain
            </p>
          </div>
        </div>

        <div className="public-footer-bottom">
          <span>
            © 2026 {
              branding.appName
            }. Tous droits réservés.
          </span>

          <div>
            <a href="#contact">
              Confidentialité
            </a>

            <a href="#contact">
              Conditions d’utilisation
            </a>

            <a href="#contact">
              Aide
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
