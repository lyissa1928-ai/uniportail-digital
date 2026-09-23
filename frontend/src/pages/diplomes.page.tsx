import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  api,
  ApiException,
} from '../lib/api';

import {
  useAuth,
} from '../auth/auth-context';

type Tab =
  | 'eligibilite'
  | 'demandes'
  | 'externes'
  | 'registre'
  | 'mes-demandes';

interface Etudiant {
  id?: number;
  matricule?: string;
  nom?: string;
  prenom?: string;
}

interface Classe {
  id?: number;
  code?: string;
  nom?: string;

  niveau?: {
    id?: number;
    code?: string;
    nom?: string;
    terminal?: boolean;

    formation?: {
      id?: number;
      code?: string;
      nom?: string;
    };
  };
}

interface Inscription {
  id: number;
  etudiantId?: number;
  classeId?: number;
  anneeAcademique?: string;
  statut?: string;
  etudiant?: Etudiant;
  classe?: Classe;
}

interface Eligibilite {
  id?: number;
  inscriptionId?: number;

  decision?: string;
  creditsObtenus?: number;
  stageValide?: boolean;
  memoireValide?: boolean;
  dateDeliberation?: string | null;
  observations?: string | null;

  inscription?: Inscription;

  etudiant?: Etudiant;
  classe?: Classe;

  anneeAcademique?: string;
  statut?: string;
}

interface DemandeDiplome {
  id: number;
  statut: string;

  inscriptionId?: number;

  createdAt?: string;
  updatedAt?: string;

  motifRejet?: string | null;
  observations?: string | null;

  inscription?: Inscription;

  diplome?: Diplome | null;
}

interface DemandeDiplomeExterne {
  id: number;
  reference: string;
  email: string;
  matricule?: string | null;
  nom: string;
  prenom: string;
  dateNaissance: string;
  anneeObtention: number;
  intituleDiplome: string;
  typeDemande:
    | 'PREMIERE_DEMANDE'
    | 'DUPLICATA';
  statut:
    | 'DEMANDEE'
    | 'EN_VERIFICATION'
    | 'DISPONIBLE'
    | 'REJETEE';
  motif?: string | null;
  traiteePar?: string | null;
  dateValidation?: string | null;
  dateDisponibilite?: string | null;
  confirmationEnvoyeeLe?: string | null;
  disponibiliteEnvoyeeLe?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface Diplome {
  id: number;

  numeroDiplome?: string;
  numero?: string;

  typeDiplome?: string;
  intitule?: string;

  nomEtudiant?: string;
  prenomEtudiant?: string;
  matriculeEtudiant?: string;

  formation?: string;
  niveau?: string;

  dateGeneration?: string;
  dateSignature?: string;
  dateRetrait?: string;

  demandeDiplomeId?: number;

  demandeDiplome?: DemandeDiplome;
}

interface ConsultationResponse<T> {
  data: T[];

  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

const emptyValidation = {
  inscriptionId: '',
  decision: 'ADMIS',
  creditsObtenus: '',
  stageValide: false,
  memoireValide: false,
  dateDeliberation:
    new Date()
      .toISOString()
      .slice(0, 10),

  observations: '',
};

export function DiplomesPage() {
  const {
    user,
  } = useAuth();

  const permissions =
    user?.permissions ?? [];

  const canEligibilityRead =
    permissions.includes(
      'ELIGIBILITE_CONSULTER',
    ) ||
    permissions.includes(
      'ELIGIBILITE_GERER',
    );

  const canEligibilityManage =
    permissions.includes(
      'ELIGIBILITE_GERER',
    );

  const canDiplomasManage =
    permissions.includes(
      'DIPLOMES_GERER',
    );

  const canRequest =
    permissions.includes(
      'DIPLOME_DEMANDER',
    );

  const firstTab: Tab =
    canEligibilityRead
      ? 'eligibilite'
      : canDiplomasManage
        ? 'demandes'
        : 'mes-demandes';

  const [
    tab,
    setTab,
  ] =
    useState<Tab>(
      firstTab,
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
    message,
    setMessage,
  ] =
    useState('');

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    eligibles,
    setEligibles,
  ] =
    useState<Eligibilite[]>([]);

  const [
    nonEligibles,
    setNonEligibles,
  ] =
    useState<Eligibilite[]>([]);

  const [
    demandes,
    setDemandes,
  ] =
    useState<DemandeDiplome[]>([]);

  const [
    diplomes,
    setDiplomes,
  ] =
    useState<Diplome[]>([]);

  const [
    demandesExternes,
    setDemandesExternes,
  ] =
    useState<DemandeDiplomeExterne[]>([]);

  const [
    mesDemandes,
    setMesDemandes,
  ] =
    useState<DemandeDiplome[]>([]);

  const [
    monEligibilite,
    setMonEligibilite,
  ] =
    useState<Eligibilite[]>([]);

  const [
    validationId,
    setValidationId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    validationForm,
    setValidationForm,
  ] =
    useState(
      emptyValidation,
    );

  function notify(
    text: string,
  ) {
    setMessage(text);
    setError('');

    window.setTimeout(
      () => {
        setMessage('');
      },
      3000,
    );
  }

  function fail(
    err: unknown,
  ) {
    setError(
      err instanceof ApiException
        ? err.message
        : 'Une erreur est survenue.',
    );
  }

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const jobs:
            Promise<void>[] = [];

          if (
            canEligibilityRead
          ) {
            jobs.push(
              Promise.all([
                api<unknown>(
                  '/eligibilite/eligibles',
                ),

                api<unknown>(
                  '/eligibilite/non-eligibles',
                ),
              ]).then(
                ([
                  eligibleData,
                  nonEligibleData,
                ]) => {
                  setEligibles(
                    toArray<Eligibilite>(
                      eligibleData,
                    ),
                  );

                  setNonEligibles(
                    toArray<Eligibilite>(
                      nonEligibleData,
                    ),
                  );
                },
              ),
            );
          }

          if (
            canDiplomasManage
          ) {
            jobs.push(
              api<unknown>(
                '/diplomes/demandes',
              ).then(
                (data) => {
                  setDemandes(
                    toArray<DemandeDiplome>(
                      data,
                    ),
                  );
                },
              ),
            );

            jobs.push(
              api<
                ConsultationResponse<Diplome>
              >(
                '/consultation/diplomes?limit=100',
              )
                .then(
                  (data) => {
                    setDiplomes(
                      data.data ?? [],
                    );
                  },
                )
                .catch(
                  () => {
                    setDiplomes([]);
                  },
                ),
            );

            jobs.push(
              api<DemandeDiplomeExterne[]>(
                '/diplomes/demandes-externes',
              )
                .then(
                  (data) => {
                    setDemandesExternes(
                      Array.isArray(
                        data,
                      )
                        ? data
                        : [],
                    );
                  },
                )
                .catch(
                  () => {
                    setDemandesExternes([]);
                  },
                ),
            );
          }

          if (
            canRequest &&
            !canDiplomasManage
          ) {
            jobs.push(
              api<unknown>(
                '/diplomes/mes-demandes',
              ).then(
                (data) => {
                  setMesDemandes(
                    toArray<DemandeDiplome>(
                      data,
                    ),
                  );
                },
              ),
            );

            jobs.push(
              api<unknown>(
                '/me/etudiant/eligibilite',
              ).then(
                (data) => {
                  setMonEligibilite(
                    toArray<Eligibilite>(
                      data,
                    ),
                  );
                },
              ),
            );
          }

          await Promise.all(
            jobs,
          );
        }
        catch (err) {
          fail(err);
        }
        finally {
          setLoading(false);
        }
      },
      [
        canEligibilityRead,
        canDiplomasManage,
        canRequest,
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

  function resetValidation() {
    setValidationId(
      null,
    );

    setValidationForm(
      emptyValidation,
    );
  }

  function prepareValidation(
    item: Eligibilite,
  ) {
    const inscriptionId =
      getInscriptionId(
        item,
      );

    setValidationId(
      item.id ?? null,
    );

    setValidationForm({
      inscriptionId:
        inscriptionId
          ? String(
              inscriptionId,
            )
          : '',

      decision:
        item.decision ??
        'ADMIS',

      creditsObtenus:
        item.creditsObtenus !==
        undefined
          ? String(
              item.creditsObtenus,
            )
          : '',

      stageValide:
        item.stageValide ??
        false,

      memoireValide:
        item.memoireValide ??
        false,

      dateDeliberation:
        item.dateDeliberation
          ? item.dateDeliberation.slice(
              0,
              10,
            )
          : new Date()
              .toISOString()
              .slice(
                0,
                10,
              ),

      observations:
        item.observations ??
        '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function saveValidation(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const inscriptionId =
      Number(
        validationForm
          .inscriptionId,
      );

    if (
      !Number.isFinite(
        inscriptionId,
      ) ||
      inscriptionId <= 0
    ) {
      setError(
        'Inscription invalide.',
      );

      return;
    }

    try {
      const payload = {
        inscriptionId,

        decision:
          validationForm
            .decision,

        creditsObtenus:
          validationForm
            .creditsObtenus
            ? Number(
                validationForm
                  .creditsObtenus,
              )
            : 0,

        stageValide:
          validationForm
            .stageValide,

        memoireValide:
          validationForm
            .memoireValide,

        dateDeliberation:
          validationForm
            .dateDeliberation,

        observations:
          validationForm
            .observations ||
          undefined,
      };

      await api(
        validationId
          ? `/eligibilite/validations/${validationId}`
          : '/eligibilite/validations',
        {
          method:
            validationId
              ? 'PATCH'
              : 'POST',

          body:
            JSON.stringify(
              payload,
            ),
        },
      );

      notify(
        validationId
          ? 'Validation académique mise ÃƒÆ’Ã‚Â  jour.'
          : 'Validation académique enregistrée.',
      );

      resetValidation();

      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function createDiplomaRequest(
    inscriptionId: number,
  ) {
    if (
      !window.confirm(
        'Envoyer la demande de diplôme pour cette inscription ?',
      )
    ) {
      return;
    }

    try {
      await api(
        '/diplomes/mes-demandes',
        {
          method: 'POST',

          body:
            JSON.stringify({
              inscriptionId,
            }),
        },
      );

      notify(
        'Votre demande de diplôme a été enregistrée.',
      );

      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function transition(
    demande:
      DemandeDiplome,

    action: string,
  ) {
    let body:
      Record<
        string,
        unknown
      > | undefined;

    if (
      action ===
        'retirer'
    ) {
      const retirePar =
        window.prompt(
          'Nom de la personne qui retire le diplôme :',
        );

      if (
        !retirePar?.trim()
      ) {
        return;
      }

      body = {
        retirePar:
          retirePar.trim(),
      };
    }

    if (
      action ===
        'rejeter' ||
      action ===
        'correction'
    ) {
      const motif =
        window.prompt(
          action ===
            'rejeter'
            ? 'Motif du rejet :'
            : 'Correction demandée :',
        );

      if (
        !motif?.trim()
      ) {
        return;
      }

      body = {
        motif:
          motif.trim(),
      };
    }

    const labels:
      Record<
        string,
        string
      > = {
        'verifier':
          'Passer cette demande en vérification ?',

        'correction':
          'Demander une correction ?',

        valider:
          'Valider cette demande ?',

        rejeter:
          'Rejeter cette demande ?',

        generer:
          'Générer le diplôme ?',

        signer:
          'Confirmer la signature du diplôme ?',

        disponible:
          'Rendre le diplôme disponible ?',

        retirer:
          'Confirmer le retrait du diplôme ?',
      };

    if (
      !window.confirm(
        labels[action] ??
        'Confirmer cette opération ?',
      )
    ) {
      return;
    }

    try {
      await api(
        `/diplomes/demandes/${demande.id}/${action}`,
        {
          method:
            action === 'generer'
              ? 'POST'
              : 'PATCH',

          body:
            body
              ? JSON.stringify(
                  body,
                )
              : undefined,
        },
      );

      notify(
        'Statut de la demande mis ÃƒÆ’Ã‚Â  jour.',
      );

      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function transitionExterne(
    demande:
      DemandeDiplomeExterne,

    action:
      'verifier' |
      'valider' |
      'rejeter' |
      'renvoyer-disponibilite',
  ) {
    let body:
      Record<
        string,
        unknown
      > | undefined;

    if (
      action ===
      'rejeter'
    ) {
      const motif =
        window.prompt(
          'Motif du rejet :',
        );

      if (
        !motif?.trim()
      ) {
        return;
      }

      body = {
        motif:
          motif.trim(),
      };
    }

    const labels:
      Record<
        string,
        string
      > = {
        verifier:
          'Mettre cette demande en vérification ?',
        valider:
          'Valider cette demande et confirmer la disponibilité du diplôme ? Un e-mail sera envoyé au demandeur.',
        rejeter:
          'Rejeter cette demande ?',
        'renvoyer-disponibilite':
          'Renvoyer l’e-mail de disponibilité au demandeur ?',
      };

    if (
      !window.confirm(
        labels[action],
      )
    ) {
      return;
    }

    try {
      await api(
        action ===
          'renvoyer-disponibilite'
          ? `/diplomes/demandes-externes/${demande.id}/renvoyer-disponibilite`
          : `/diplomes/demandes-externes/${demande.id}/${action}`,
        {
          method:
            action ===
              'renvoyer-disponibilite'
              ? 'POST'
              : 'PATCH',

          body:
            body
              ? JSON.stringify(
                  body,
                )
              : undefined,
        },
      );

      notify(
        action ===
          'valider'
          ? 'Demande validée. La disponibilité a été notifiée au demandeur.'
          : action ===
            'renvoyer-disponibilite'
            ? 'E-mail de disponibilité renvoyé.'
            : 'Demande mise à jour.',
      );

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

  const filteredDemandes =
    useMemo(
      () =>
        demandes.filter(
          (item) =>
            demandeSearchText(
              item,
            ).includes(
              query,
            ),
        ),
      [
        demandes,
        query,
      ],
    );

  const filteredDemandesExternes =
    useMemo(
      () =>
        demandesExternes.filter(
          (item) =>
            [
              item.reference,
              item.email,
              item.matricule,
              item.nom,
              item.prenom,
              item.intituleDiplome,
              item.typeDemande,
              item.statut,
              item.anneeObtention,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(
                query,
              ),
        ),
      [
        demandesExternes,
        query,
      ],
    );

  const filteredDiplomes =
    useMemo(
      () =>
        diplomes.filter(
          (item) =>
            [
              item.numeroDiplome,
              item.numero,
              item.typeDiplome,
              item.intitule,
              item.nomEtudiant,
              item.prenomEtudiant,
              item.matriculeEtudiant,
              item.formation,
              item.niveau,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(
                query,
              ),
        ),
      [
        diplomes,
        query,
      ],
    );

  if (loading) {
    return (
      <section className="panel">
        Chargement du module diplômes...
      </section>
    );
  }

  return (
    <div className="page-stack diplomes-premium">

      <section className="page-header">
        <div>
          <span className="eyebrow">
            Cycle académique
          </span>

          <h1>
            Diplômes
          </h1>

          <p>
            Contrôle académique,
            demandes, validation,
            génération, signature,
            disponibilité et retrait.
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

        {canEligibilityRead && (
          <>
            <article className="stat-card">
              <span>Étudiants éligibles</span>

              <strong>
                {
                  eligibles.length
                }
              </strong>
            </article>

            <article className="stat-card">
              <span>
                Non éligibles
              </span>

              <strong>
                {
                  nonEligibles.length
                }
              </strong>
            </article>
          </>
        )}

        {canDiplomasManage && (
          <>
            <article className="stat-card">
              <span>
                Demandes
              </span>

              <strong>
                {
                  demandes.length
                }
              </strong>
            </article>

            <article className="stat-card">
              <span>
                Diplômes
              </span>

              <strong>
                {
                  diplomes.length
                }
              </strong>
            </article>

            <article className="stat-card">
              <span>
                Demandes externes
              </span>

              <strong>
                {
                  demandesExternes.length
                }
              </strong>
            </article>
          </>
        )}

        {canRequest &&
          !canDiplomasManage && (
          <>
            <article className="stat-card">
              <span>
                Mes demandes
              </span>

              <strong>
                {
                  mesDemandes.length
                }
              </strong>
            </article>

            <article className="stat-card">
              <span>
                Disponibles
              </span>

              <strong>
                {
                  mesDemandes.filter(
                    (item) =>
                      item.statut ===
                      'DISPONIBLE',
                  ).length
                }
              </strong>
            </article>
          </>
        )}

      </section>

      <section className="panel">

        <div className="toolbar">

          <div className="tabs">

            {canEligibilityRead && (
              <button
                type="button"
                className={
                  tab ===
                    'eligibilite'
                    ? 'tab active'
                    : 'tab'
                }
                onClick={() =>
                  setTab(
                    'eligibilite',
                  )
                }
              >Décision académique</button>
            )}

            {canDiplomasManage && (
              <button
                type="button"
                className={
                  tab ===
                    'demandes'
                    ? 'tab active'
                    : 'tab'
                }
                onClick={() =>
                  setTab(
                    'demandes',
                  )
                }
              >
                Demandes
              </button>
            )}

            {canDiplomasManage && (
              <button
                type="button"
                className={
                  tab ===
                    'externes'
                    ? 'tab active'
                    : 'tab'
                }
                onClick={() =>
                  setTab(
                    'externes',
                  )
                }
              >
                Demandes publiques
              </button>
            )}

            {canDiplomasManage && (
              <button
                type="button"
                className={
                  tab ===
                    'registre'
                    ? 'tab active'
                    : 'tab'
                }
                onClick={() =>
                  setTab(
                    'registre',
                  )
                }
              >
                Registre des diplômes
              </button>
            )}

            {canRequest &&
              !canDiplomasManage && (
              <button
                type="button"
                className={
                  tab ===
                    'mes-demandes'
                    ? 'tab active'
                    : 'tab'
                }
                onClick={() =>
                  setTab(
                    'mes-demandes',
                  )
                }
              >
                Mes demandes
              </button>
            )}

          </div>

          {(tab ===
              'demandes' ||
            tab ===
              'externes' ||
            tab ===
              'registre') && (
            <input
              className="search-input"
              value={search}
              onChange={
                (event) =>
                  setSearch(
                    event.target
                      .value,
                  )
              }
              placeholder="Rechercher..."
            />
          )}

        </div>

      </section>

      {tab ===
        'eligibilite' &&
        canEligibilityRead && (
        <EligibilityView
          eligibles={
            eligibles
          }
          nonEligibles={
            nonEligibles
          }
          canManage={
            canEligibilityManage
          }
          validationId={
            validationId
          }
          validationForm={
            validationForm
          }
          setValidationForm={
            setValidationForm
          }
          prepareValidation={
            prepareValidation
          }
          resetValidation={
            resetValidation
          }
          saveValidation={
            saveValidation
          }
        />
      )}

      {tab ===
        'demandes' &&
        canDiplomasManage && (
        <DemandesView
          demandes={
            filteredDemandes
          }
          transition={
            transition
          }
        />
      )}

      {tab ===
        'externes' &&
        canDiplomasManage && (
        <ExternalRequestsView
          demandes={
            filteredDemandesExternes
          }
          transition={
            transitionExterne
          }
        />
      )}

      {tab ===
        'registre' &&
        canDiplomasManage && (
        <RegistreView
          diplomes={
            filteredDiplomes
          }
        />
      )}

      {tab ===
        'mes-demandes' &&
        canRequest &&
        !canDiplomasManage && (
        <StudentDiplomaView
          eligibilite={
            monEligibilite
          }
          demandes={
            mesDemandes
          }
          createRequest={
            createDiplomaRequest
          }
        />
      )}

    </div>
  );
}

interface EligibilityViewProps {
  eligibles:
    Eligibilite[];

  nonEligibles:
    Eligibilite[];

  canManage:
    boolean;

  validationId:
    number | null;

  validationForm:
    typeof emptyValidation;

  setValidationForm:
    Dispatch<
      SetStateAction<
        typeof emptyValidation
      >
    >;

  prepareValidation:
    (
      item:
        Eligibilite,
    ) => void;

  resetValidation:
    () => void;

  saveValidation:
    (
      event:
        FormEvent<HTMLFormElement>,
    ) => Promise<void>;
}

function EligibilityView({
  eligibles,
  nonEligibles,
  canManage,
  validationId,
  validationForm,
  setValidationForm,
  prepareValidation,
  resetValidation,
  saveValidation,
}: EligibilityViewProps) {
  return (
    <div className="page-stack diplomes-premium">

      {canManage && (
        <section className="panel">

          <div className="section-title-row">

            <div>
              <h2>
                Décision académique
              </h2>

              <p className="muted">
                L'éligibilité au diplôme
                dépend du niveau terminal,
                de la fin d'inscription et
                de la décision académique.
              </p>
            </div>

            {validationId && (
              <button
                type="button"
                className="text-button"
                onClick={
                  resetValidation
                }
              >
                Annuler
              </button>
            )}

          </div>

          <form
            className="eligibility-form"
            onSubmit={
              saveValidation
            }
          >

            <label>
              ID inscription

              <input
                type="number"
                min="1"
                required
                value={
                  validationForm
                    .inscriptionId
                }
                onChange={
                  (event) =>
                    setValidationForm({
                      ...validationForm,

                      inscriptionId:
                        event.target
                          .value,
                    })
                }
              />
            </label>

            <label>
              Décision

              <select
                value={
                  validationForm
                    .decision
                }
                onChange={
                  (event) =>
                    setValidationForm({
                      ...validationForm,

                      decision:
                        event.target
                          .value,
                    })
                }
              >
                <option value="ADMIS">
                  Admis
                </option>

                <option value="AJOURNE">
                  Ajourné
                </option>

                <option value="REFUSE">
                  Refusé
                </option>

                <option value="EN_ATTENTE">
                  En attente
                </option>
              </select>
            </label>

            <label>
              Crédits obtenus

              <input
                type="number"
                min="0"
                value={
                  validationForm
                    .creditsObtenus
                }
                onChange={
                  (event) =>
                    setValidationForm({
                      ...validationForm,

                      creditsObtenus:
                        event.target
                          .value,
                    })
                }
              />
            </label>

            <label>
              Date délibération

              <input
                type="date"
                value={
                  validationForm
                    .dateDeliberation
                }
                onChange={
                  (event) =>
                    setValidationForm({
                      ...validationForm,

                      dateDeliberation:
                        event.target
                          .value,
                    })
                }
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={
                  validationForm
                    .stageValide
                }
                onChange={
                  (event) =>
                    setValidationForm({
                      ...validationForm,

                      stageValide:
                        event.target
                          .checked,
                    })
                }
              />

              Stage validé
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={
                  validationForm
                    .memoireValide
                }
                onChange={
                  (event) =>
                    setValidationForm({
                      ...validationForm,

                      memoireValide:
                        event.target
                          .checked,
                    })
                }
              />

              Mémoire / soutenance validé
            </label>

            <label className="eligibility-observations">
              Observations

              <textarea
                rows={3}
                value={
                  validationForm
                    .observations
                }
                onChange={
                  (event) =>
                    setValidationForm({
                      ...validationForm,

                      observations:
                        event.target
                          .value,
                    })
                }
              />
            </label>

            <button
              type="submit"
              className="primary-button"
            >
              {
                validationId
                  ? 'Mettre ÃƒÆ’Ã‚Â  jour'
                  : 'Enregistrer la décision'
              }
            </button>

          </form>

        </section>
      )}

      <section className="eligibility-columns">

        <article className="panel">

          <div className="section-title-row">
            <div>
              <h2>Étudiants éligibles</h2>

              <p className="muted">
                Dossiers remplissant les
                conditions académiques.
              </p>
            </div>

            <span className="counter-badge">
              {
                eligibles.length
              }
            </span>
          </div>

          <EligibilityTable
            items={
              eligibles
            }
            canManage={
              canManage
            }
            onEdit={
              prepareValidation
            }
          />

        </article>

        <article className="panel">

          <div className="section-title-row">
            <div>
              <h2>
                Non éligibles
              </h2>

              <p className="muted">
                Dossiers restant ÃƒÆ’Ã‚Â 
                compléter ou non admis.
              </p>
            </div>

            <span className="counter-badge warning">
              {
                nonEligibles.length
              }
            </span>
          </div>

          <EligibilityTable
            items={
              nonEligibles
            }
            canManage={
              canManage
            }
            onEdit={
              prepareValidation
            }
          />

        </article>

      </section>

    </div>
  );
}

function EligibilityTable({
  items,
  canManage,
  onEdit,
}: {
  items:
    Eligibilite[];

  canManage:
    boolean;

  onEdit:
    (
      item:
        Eligibilite,
    ) => void;
}) {
  if (
    items.length === 0
  ) {
    return (
      <p className="empty-state">
        Aucun dossier.
      </p>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>
              Étudiant
            </th>

            <th>
              Parcours
            </th>

            <th>
              Crédits
            </th>

            <th>
              Décision
            </th>

            {canManage && (
              <th>
                Action
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {
            items.map(
              (
                item,
                index,
              ) => {
                const student =
                  getStudent(
                    item,
                  );

                const inscription =
                  getInscription(
                    item,
                  );

                const classe =
                  getClasse(
                    item,
                  );

                return (
                  <tr
                    key={
                      item.id ??
                      getInscriptionId(
                        item,
                      ) ??
                      index
                    }
                  >
                    <td>
                      <strong>
                        {
                          student
                            ?.matricule ??
                          '-'
                        }
                      </strong>

                      <small className="table-subtitle">
                        {
                          student
                            ? `${student.prenom ?? ''} ${student.nom ?? ''}`.trim()
                            : '-'
                        }
                      </small>
                    </td>

                    <td>
                      {
                        classe
                          ?.niveau
                          ?.formation
                          ?.nom ??
                        '-'
                      }

                      <small className="table-subtitle">
                        {
                          classe
                            ?.niveau
                            ?.nom ??
                          classe
                            ?.nom ??
                          '-'
                        } · {
                          inscription
                            ?.anneeAcademique ??
                          item.anneeAcademique ??
                          '-'
                        }
                      </small>
                    </td>

                    <td>
                      {
                        item.creditsObtenus ??
                        '-'
                      }
                    </td>

                    <td>
                      <DecisionBadge
                        value={
                          item.decision ??
                          'EN_ATTENTE'
                        }
                      />
                    </td>

                    {canManage && (
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(
                              item,
                            )
                          }
                        >
                          Évaluer
                        </button>
                      </td>
                    )}
                  </tr>
                );
              },
            )
          }
        </tbody>
      </table>
    </div>
  );
}

function DemandesView({
  demandes,
  transition,
}: {
  demandes:
    DemandeDiplome[];

  transition:
    (
      demande:
        DemandeDiplome,
      action:
        string,
    ) => Promise<void>;
}) {
  return (
    <section className="panel table-panel">

      <div className="section-title-row">
        <div>
          <h2>
            Demandes de diplômes
          </h2>

          <p className="muted">
            Traitement administratif
            du dossier jusqu'au retrait.
          </p>
        </div>

        <span className="counter-badge">
          {
            demandes.length
          }
        </span>
      </div>

      <div className="table-scroll">

        <table>
          <thead>
            <tr>
              <th>
                Étudiant
              </th>

              <th>
                Formation
              </th>

              <th>
                Demande
              </th>

              <th>
                Statut
              </th>

              <th>
                Action suivante
              </th>
            </tr>
          </thead>

          <tbody>
            {
              demandes.length ===
              0
                ? (
                  <tr>
                    <td
                      colSpan={5}
                    >
                      Aucune demande.
                    </td>
                  </tr>
                )
                : demandes.map(
                    (item) => {
                      const inscription =
                        item.inscription;

                      const student =
                        inscription
                          ?.etudiant;

                      const formation =
                        inscription
                          ?.classe
                          ?.niveau
                          ?.formation;

                      return (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td>
                            <strong>
                              {
                                student
                                  ?.matricule ??
                                '-'
                              }
                            </strong>

                            <small className="table-subtitle">
                              {
                                student
                                  ? `${student.prenom ?? ''} ${student.nom ?? ''}`.trim()
                                  : '-'
                              }
                            </small>
                          </td>

                          <td>
                            {
                              formation
                                ?.nom ??
                              '-'
                            }

                            <small className="table-subtitle">
                              {
                                inscription
                                  ?.classe
                                  ?.niveau
                                  ?.nom ??
                                '-'
                              }
                            </small>
                          </td>

                          <td>
                            {
                              formatDate(
                                item.createdAt,
                              )
                            }
                          </td>

                          <td>
                            <DiplomaStatus
                              value={
                                item.statut
                              }
                            />
                          </td>

                          <td>
                            <WorkflowActions
                              demande={
                                item
                              }
                              transition={
                                transition
                              }
                            />
                          </td>
                        </tr>
                      );
                    },
                  )
            }
          </tbody>
        </table>

      </div>

    </section>
  );
}

function WorkflowActions({
  demande,
  transition,
}: {
  demande:
    DemandeDiplome;

  transition:
    (
      demande:
        DemandeDiplome,
      action:
        string,
    ) => Promise<void>;
}) {
  switch (
    demande.statut
  ) {
    case 'DEMANDEE':
      return (
        <button
          type="button"
          onClick={() =>
            void transition(
              demande,
              'verifier',
            )
          }
        >
          Vérifier
        </button>
      );

    case 'EN_VERIFICATION':
      return (
        <div className="action-buttons">

          <button
            type="button"
            className="approve-button compact"
            onClick={() =>
              void transition(
                demande,
                'valider',
              )
            }
          >
            Valider
          </button>

          <button
            type="button"
            onClick={() =>
              void transition(
                demande,
                'correction',
              )
            }
          >
            Corriger
          </button>

          <button
            type="button"
            className="reject-button compact"
            onClick={() =>
              void transition(
                demande,
                'rejeter',
              )
            }
          >
            Rejeter
          </button>

        </div>
      );

    case 'VALIDEE':
      return (
        <button
          type="button"
          onClick={() =>
            void transition(
              demande,
              'generer',
            )
          }
        >
          Générer
        </button>
      );

    case 'GENEREE':
      return (
        <button
          type="button"
          onClick={() =>
            void transition(
              demande,
              'signer',
            )
          }
        >
          Signer
        </button>
      );

    case 'SIGNEE':
      return (
        <button
          type="button"
          onClick={() =>
            void transition(
              demande,
              'disponible',
            )
          }
        >
          Rendre disponible
        </button>
      );

    case 'DISPONIBLE':
      return (
        <button
          type="button"
          onClick={() =>
            void transition(
              demande,
              'retirer',
            )
          }
        >
          Confirmer retrait
        </button>
      );

    case 'A_CORRIGER':
      return (
        <span className="muted">
          Correction attendue
        </span>
      );

    case 'RETIREE':
      return (
        <span className="status active">
          Terminé
        </span>
      );

    case 'REJETEE':
      return (
        <span className="muted">
          Dossier rejeté
        </span>
      );

    case 'ANNULEE':
      return (
        <span className="muted">
          Demande annulée
        </span>
      );

    default:
      return (
        <span className="muted">
          -
        </span>
      );
  }
}

function ExternalRequestsView({
  demandes,
  transition,
}: {
  demandes:
    DemandeDiplomeExterne[];

  transition:
    (
      demande:
        DemandeDiplomeExterne,

      action:
        'verifier' |
        'valider' |
        'rejeter' |
        'renvoyer-disponibilite',
    ) => Promise<void>;
}) {
  return (
    <section className="panel table-panel">
      <div className="section-title-row">
        <div>
          <h2>
            Demandes publiques
          </h2>

          <p className="muted">
            Demandes déposées lorsque le matricule et l’adresse e-mail ne correspondent à aucun dossier interne.
          </p>
        </div>

        <span className="counter-badge">
          {demandes.length}
        </span>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>
                Référence
              </th>

              <th>
                Demandeur
              </th>

              <th>
                Diplôme
              </th>

              <th>
                Type
              </th>

              <th>
                Statut
              </th>

              <th>
                E-mails
              </th>

              <th>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {demandes.length ===
            0 ? (
              <tr>
                <td colSpan={7}>
                  Aucune demande publique.
                </td>
              </tr>
            ) : (
              demandes.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.reference}
                      </strong>

                      <small className="table-subtitle">
                        {formatDate(
                          item.createdAt,
                        )}
                      </small>
                    </td>

                    <td>
                      <strong>
                        {item.prenom} {item.nom}
                      </strong>

                      <small className="table-subtitle">
                        {item.email}
                      </small>

                      <small className="table-subtitle">
                        Matricule : {item.matricule ?? 'non renseigné'}
                      </small>

                      <small className="table-subtitle">
                        Né(e) le {formatDate(
                          item.dateNaissance,
                        )}
                      </small>
                    </td>

                    <td>
                      {item.intituleDiplome}

                      <small className="table-subtitle">
                        Année : {item.anneeObtention}
                      </small>
                    </td>

                    <td>
                      {item.typeDemande ===
                      'DUPLICATA'
                        ? 'Duplicata'
                        : 'Diplôme'}
                    </td>

                    <td>
                      <DiplomaStatus
                        value={
                          item.statut
                        }
                      />

                      {item.motif && (
                        <small className="table-subtitle">
                          {item.motif}
                        </small>
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          item.confirmationEnvoyeeLe
                            ? 'status active'
                            : 'status inactive'
                        }
                      >
                        Réception {
                          item.confirmationEnvoyeeLe
                            ? 'envoyée'
                            : 'non envoyée'
                        }
                      </span>

                      <small className="table-subtitle">
                        Disponibilité : {
                          item.disponibiliteEnvoyeeLe
                            ? 'envoyée'
                            : 'non envoyée'
                        }
                      </small>
                    </td>

                    <td>
                      <div className="action-buttons">
                        {item.statut ===
                        'DEMANDEE' && (
                          <button
                            type="button"
                            onClick={
                              () =>
                                void transition(
                                  item,
                                  'verifier',
                                )
                            }
                          >
                            Vérifier
                          </button>
                        )}

                        {[
                          'DEMANDEE',
                          'EN_VERIFICATION',
                        ].includes(
                          item.statut,
                        ) && (
                          <>
                            <button
                              type="button"
                              className="approve-button compact"
                              onClick={
                                () =>
                                  void transition(
                                    item,
                                    'valider',
                                  )
                              }
                            >
                              Valider & disponible
                            </button>

                            <button
                              type="button"
                              className="reject-button compact"
                              onClick={
                                () =>
                                  void transition(
                                    item,
                                    'rejeter',
                                  )
                              }
                            >
                              Rejeter
                            </button>
                          </>
                        )}

                        {item.statut ===
                        'DISPONIBLE' && (
                          <button
                            type="button"
                            onClick={
                              () =>
                                void transition(
                                  item,
                                  'renvoyer-disponibilite',
                                )
                            }
                          >
                            Renvoyer l’e-mail
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RegistreView({
  diplomes,
}: {
  diplomes:
    Diplome[];
}) {
  return (
    <section className="panel table-panel">

      <div className="section-title-row">
        <div>
          <h2>
            Registre des diplômes
          </h2>

          <p className="muted">
            Diplômes générés et
            références officielles.
          </p>
        </div>

        <span className="counter-badge">
          {
            diplomes.length
          }
        </span>
      </div>

      <div className="table-scroll">

        <table>
          <thead>
            <tr>
              <th>
                Numéro
              </th>

              <th>
                Étudiant
              </th>

              <th>
                Diplôme
              </th>

              <th>
                Formation
              </th>

              <th>
                Génération
              </th>

              <th>
                Signature
              </th>

              <th>
                Retrait
              </th>
            </tr>
          </thead>

          <tbody>
            {
              diplomes.length ===
              0
                ? (
                  <tr>
                    <td
                      colSpan={7}
                    >
                      Aucun diplôme généré.
                    </td>
                  </tr>
                )
                : diplomes.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td>
                          <strong>
                            {
                              item.numeroDiplome ??
                              item.numero ??
                              `#${item.id}`
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            item.matriculeEtudiant ??
                            '-'
                          }

                          <small className="table-subtitle">
                            {
                              `${item.prenomEtudiant ?? ''} ${item.nomEtudiant ?? ''}`.trim() ||
                              '-'
                            }
                          </small>
                        </td>

                        <td>
                          {
                            item.typeDiplome ??
                            item.intitule ??
                            '-'
                          }
                        </td>

                        <td>
                          {
                            item.formation ??
                            '-'
                          }

                          <small className="table-subtitle">
                            {
                              item.niveau ??
                              '-'
                            }
                          </small>
                        </td>

                        <td>
                          {
                            formatDate(
                              item.dateGeneration,
                            )
                          }
                        </td>

                        <td>
                          {
                            formatDate(
                              item.dateSignature,
                            )
                          }
                        </td>

                        <td>
                          {
                            formatDate(
                              item.dateRetrait,
                            )
                          }
                        </td>
                      </tr>
                    ),
                  )
            }
          </tbody>
        </table>

      </div>

    </section>
  );
}

function StudentDiplomaView({
  eligibilite,
  demandes,
  createRequest,
}: {
  eligibilite:
    Eligibilite[];

  demandes:
    DemandeDiplome[];

  createRequest:
    (
      inscriptionId:
        number,
    ) => Promise<void>;
}) {
  const admitted =
    eligibilite.filter(
      (item) =>
        item.decision ===
        'ADMIS',
    );

  const requestedIds =
    new Set(
      demandes
        .map(
          (item) =>
            item.inscriptionId ??
            item.inscription
              ?.id,
        )
        .filter(
          (
            value,
          ): value is number =>
            typeof value ===
            'number',
        ),
    );

  return (
    <div className="page-stack diplomes-premium">

      <section className="panel">

        <div className="section-title-row">
          <div>
            <h2>
              Mon éligibilité
            </h2>

            <p className="muted">
              Une demande peut être
              déposée uniquement après
              validation académique.
            </p>
          </div>
        </div>

        <div className="student-eligibility-grid">

          {
            admitted.length ===
            0
              ? (
                <div className="empty-state">
                  Aucun parcours éligible
                  au diplôme actuellement.
                </div>
              )
              : admitted.map(
                  (
                    item,
                    index,
                  ) => {
                    const inscriptionId =
                      getInscriptionId(
                        item,
                      );

                    const inscription =
                      getInscription(
                        item,
                      );

                    const classe =
                      getClasse(
                        item,
                      );

                    const alreadyRequested =
                      inscriptionId
                        ? requestedIds.has(
                            inscriptionId,
                          )
                        : false;

                    return (
                      <article
                        className="eligibility-card eligible"
                        key={
                          inscriptionId ??
                          item.id ??
                          index
                        }
                      >
                        <div>
                          <span className="status active">
                            ÉLIGIBLE
                          </span>

                          <h3>
                            {
                              classe
                                ?.niveau
                                ?.formation
                                ?.nom ??
                              'Formation'
                            }
                          </h3>

                          <p>
                            {
                              classe
                                ?.niveau
                                ?.nom ??
                              classe
                                ?.nom ??
                              '-'
                            }
                            {' · '}
                            {
                              inscription
                                ?.anneeAcademique ??
                              '-'
                            }
                          </p>
                        </div>

                        <button
                          type="button"
                          className="primary-button"
                          disabled={
                            !inscriptionId ||
                            alreadyRequested
                          }
                          onClick={() => {
                            if (
                              inscriptionId
                            ) {
                              void createRequest(
                                inscriptionId,
                              );
                            }
                          }}
                        >
                          {
                            alreadyRequested
                              ? 'Demande déjÃƒÆ’Ã‚Â  déposée'
                              : 'Demander mon diplôme'
                          }
                        </button>
                      </article>
                    );
                  },
                )
          }

        </div>

      </section>

      <section className="panel table-panel">

        <div className="section-title-row">
          <div>
            <h2>
              Suivi de mes demandes
            </h2>

            <p className="muted">
              État d'avancement auprès
              du service des diplômes.
            </p>
          </div>

          <span className="counter-badge">
            {
              demandes.length
            }
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>
                Référence
              </th>

              <th>
                Dépôt
              </th>

              <th>
                Statut
              </th>

              <th>
                Diplôme
              </th>
            </tr>
          </thead>

          <tbody>
            {
              demandes.length ===
              0
                ? (
                  <tr>
                    <td
                      colSpan={4}
                    >
                      Aucune demande.
                    </td>
                  </tr>
                )
                : demandes.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td>
                          #{
                            item.id
                          }
                        </td>

                        <td>
                          {
                            formatDate(
                              item.createdAt,
                            )
                          }
                        </td>

                        <td>
                          <DiplomaStatus
                            value={
                              item.statut
                            }
                          />
                        </td>

                        <td>
                          {
                            item.diplome
                              ?.numeroDiplome ??
                            item.diplome
                              ?.numero ??
                            '-'
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

function DecisionBadge({
  value,
}: {
  value:
    string;
}) {
  return (
    <span
      className={
        `status decision-status ${value.toLowerCase()}`
      }
    >
      {value}
    </span>
  );
}

function DiplomaStatus({
  value,
}: {
  value:
    string;
}) {
  return (
    <span
      className={
        `status diploma-status ${value.toLowerCase()}`
      }
    >
      {value.replaceAll(
        '_',
        ' ',
      )}
    </span>
  );
}

function toArray<T>(
  value:
    unknown,
): T[] {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value as T[];
  }

  if (
    value &&
    typeof value ===
      'object' &&
    'data' in value
  ) {
    const data =
      (
        value as {
          data?: unknown;
        }
      ).data;

    if (
      Array.isArray(
        data,
      )
    ) {
      return data as T[];
    }
  }

  if (
    value &&
    typeof value ===
      'object'
  ) {
    return [
      value as T,
    ];
  }

  return [];
}

function getInscription(
  item:
    Eligibilite,
) {
  if (
    item.inscription
  ) {
    return item.inscription;
  }

  return undefined;
}

function getInscriptionId(
  item:
    Eligibilite,
) {
  return (
    item.inscriptionId ??
    item.inscription
      ?.id
  );
}

function getStudent(
  item:
    Eligibilite,
) {
  return (
    item.etudiant ??
    item.inscription
      ?.etudiant
  );
}

function getClasse(
  item:
    Eligibilite,
) {
  return (
    item.classe ??
    item.inscription
      ?.classe
  );
}

function demandeSearchText(
  item:
    DemandeDiplome,
) {
  const student =
    item.inscription
      ?.etudiant;

  const classe =
    item.inscription
      ?.classe;

  return [
    item.id,
    item.statut,
    student?.matricule,
    student?.nom,
    student?.prenom,
    classe
      ?.niveau
      ?.formation
      ?.nom,
    classe
      ?.niveau
      ?.nom,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function formatDate(
  value:
    string |
    undefined,
) {
  if (!value) {
    return '-';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    'fr-FR',
  );
}