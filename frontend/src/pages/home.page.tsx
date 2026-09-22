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

const DEFAULT_BRANDING: PublicBranding = {
  appName: 'UniPortail Digital',
  appSubtitle: 'Suivi & Évaluation Académique',
  heroTitle: 'Un suivi rigoureux pour une réussite durable',
  heroDescription:
    'UniPortail Digital centralise la gestion des enseignements, des évaluations, de la scolarité et des diplômes dans une interface unique, sécurisée et collaborative.',
  quoteText:
    'L’éducation est la clé qui ouvre les portes d’un avenir meilleur.',
  logoUrl: '/images/uniportail-logo.webp',
  heroImageUrl: '/images/login-campus.webp',
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
  | 'settings';

function Icon({
  name,
}: {
  name: IconName;
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

function HeroTitle({
  value,
}: {
  value: string;
}) {
  if (
    value
      .trim()
      .toLocaleLowerCase(
        'fr-FR',
      ) ===
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
    value
      .toLocaleLowerCase(
        'fr-FR',
      )
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

function actualiteDate(
  value:
    string,
) {
  const date =
    new Date(
      value,
    );

  return date.toLocaleDateString(
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

  useEffect(
    () => {
      let mounted =
        true;

      void api<PublicBranding>(
        '/branding/public',
      )
        .then(
          (result) => {
            if (mounted) {
              setBranding(
                result,
              );
            }
          },
        )
        .catch(
          () => {
            if (mounted) {
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

  return (
    <main className="public-home">
      <header className="public-nav">
        <Link
          to="/"
          className="public-brand"
          aria-label="Accueil UniPortail Digital"
        >
          <img
            src={branding.logoUrl}
            alt={branding.appName}
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
            <Icon name="search" />
          </button>

          <Link
            to="/login"
            className="public-login-button"
          >
            <Icon name="user" />
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
            {branding.heroDescription}
          </p>

          <div className="public-hero-actions">
            <Link
              to="/login"
              className="public-primary-cta"
            >
              <Icon name="graduate" />

              <span>
                Accéder à mon espace
              </span>

              <Icon name="arrow" />
            </Link>

            <a
              href="#fonctionnalites"
              className="public-secondary-cta"
            >
              <Icon name="play" />

              <span>
                Découvrir la plateforme
              </span>
            </a>
          </div>

          <div className="public-trust-row">
            <span>
              <Icon name="shield" />
              Données sécurisées
            </span>

            <span>
              <Icon name="users" />
              Accessible à tous les acteurs
            </span>

            <span>
              <Icon name="screen" />
              Partout, à tout moment
            </span>
          </div>
        </div>

        <blockquote className="public-hero-quote">
          <span>
            “
          </span>

          <p>
            {branding.quoteText}
          </p>
        </blockquote>
      </section>

      <section
        id="fonctionnalites"
        className="public-modules-wrap"
      >
        <div className="public-module-grid">
          {moduleCards.map(
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
                  <Icon name={item.icon} />
                </span>

                <div>
                  <h2>
                    {item.title}
                  </h2>

                  <p>
                    {item.text}
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
          )}
        </div>
      </section>

      <section
        id="apropos"
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

        <div
          id="etablissements"
          className="public-audience-grid"
        >
          {audiences.map(
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
                  <Icon name={item.icon} />
                </span>

                <strong>
                  {item.title}
                </strong>

                <p>
                  {item.text}
                </p>
              </article>
            ),
          )}
        </div>
      </section>

      {actualites.length > 0 && (
        <section
          id="actualites"
          className="public-news"
        >
          <div className="public-news-heading">
            <div>
              <span className="public-section-kicker">
                Informations récentes
              </span>

              <h2>
                Actualités
              </h2>

              <p>
                Les informations publiées par les services de la plateforme.
              </p>
            </div>

            <span className="public-news-live">
              Mise à jour en temps réel
            </span>
          </div>

          <div className="public-news-grid">
            {actualites.map(
              (item) => (
                <article
                  className="public-news-card"
                  key={
                    item.id
                  }
                >
                  <div className="public-news-media">
                    {item.imageUrl
                      ? (
                        <img
                          src={
                            item.imageUrl
                          }
                          alt=""
                        />
                      )
                      : (
                        <span className="public-news-placeholder">
                          <Icon name="file" />
                        </span>
                      )}

                    <span className="public-news-source">
                      {actualiteSourceLabel(
                        item.source,
                      )}
                    </span>
                  </div>

                  <div className="public-news-body">
                    <span className="public-news-date">
                      {actualiteDate(
                        item.dateDebut,
                      )}
                    </span>

                    <h3>
                      {item.titre}
                    </h3>

                    <p>
                      {item.resume}
                    </p>

                    <div className="public-news-footer">
                      <span>
                        {item.auteur
                          ?.nomAffichage ??
                          actualiteSourceLabel(
                            item.source,
                          )}
                      </span>

                      <span>
                        Visible jusqu’au{' '}
                        {actualiteDate(
                          item.dateFin,
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
      )}

      <footer
        id="contact"
        className="public-footer"
      >
        <div className="public-footer-main">
          <div className="public-footer-brand">
            <img
              src={branding.logoUrl}
              alt={branding.appName}
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
            © 2026 {branding.appName}. Tous droits réservés.
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
