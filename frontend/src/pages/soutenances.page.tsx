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
  | 'planning'
  | 'terminees'
  | 'rapport';

type Etudiant = {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
};

type Formation = {
  id: number;
  code: string;
  nom: string;
};

type Niveau = {
  id: number;
  code: string;
  nom: string;
  formationId: number;
  terminal?: boolean;
  formation?: Formation;
};

type Classe = {
  id: number;
  code: string;
  nom: string;
  annee?: string;
  niveauId: number;
  niveau?: Niveau;
};

type Inscription = {
  id: number;
  anneeAcademique: string;
  statut: string;
  etudiantId: number;
  classeId: number;
  etudiant?: Etudiant;
  classe?: Classe;
};

type Soutenance = {
  id: number;
  sujet: string;
  dateSoutenance: string;
  heureDebut?: string | null;
  heureFin?: string | null;
  lieu?: string | null;
  statut: string;
  decision: string;
  note?: number | null;
  mention?: string | null;
  numeroPv?: string | null;
  presidentJury?: string | null;
  membresJury?: string | null;
  observations?: string | null;
  validee: boolean;
  valideePar?: string | null;
  dateValidation?: string | null;
  inscriptionId: number;
  inscription?: Inscription;
};

type Rapport = {
  anneeAcademique: string;
  total: number;
  planifiees: number;
  reportees: number;
  annulees: number;
  terminees: number;
  validees: number;
  parDecision: Record<string, number>;
  parFormation: Record<string, number>;
  parClasse: Record<string, number>;
  parMention: Record<string, number>;
};

const emptyForm = {
  inscriptionId: '',
  sujet: '',
  dateSoutenance: '',
  heureDebut: '',
  heureFin: '',
  lieu: '',
  statut: 'PLANIFIEE',
  decision: 'EN_ATTENTE',
  note: '',
  mention: '',
  numeroPv: '',
  presidentJury: '',
  membresJury: '',
  observations: '',
};

const styles = `
.sout-page{display:grid;gap:14px;color:#1b3552}
.sout-page *{box-sizing:border-box}
.sout-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
.sout-hero h1{margin:0;color:#0b1d3a;font-size:30px}.sout-hero p{margin:5px 0 0;color:#70829a;font-size:12px}
.sout-badge{padding:10px 13px;border-radius:11px;background:#eef6ff;border:1px solid #d6e8fb;color:#2469ad;font-size:10px;font-weight:800}
.sout-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.sout-kpi{padding:14px;border:1px solid #dfe8f2;border-radius:13px;background:#fff;box-shadow:0 5px 16px rgba(22,50,84,.035)}
.sout-kpi span{display:block;color:#76879d;font-size:8px;text-transform:uppercase;letter-spacing:.05em}
.sout-kpi strong{display:block;margin-top:3px;color:#0b1d3a;font-size:24px}
.sout-tabs{display:flex;gap:6px;padding:7px;border:1px solid #dfe8f2;border-radius:12px;background:#fff}
.sout-tabs button{min-height:36px;padding:0 14px;border:0;border-radius:8px;background:#f5f8fc;color:#61758f;font-weight:800;font-size:9px;cursor:pointer}
.sout-tabs button.active{background:#0d274b;color:#fff}
.sout-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:14px;align-items:start}
.sout-card{border:1px solid #dfe8f2;border-radius:13px;background:#fff;box-shadow:0 5px 16px rgba(22,50,84,.035);overflow:hidden}
.sout-card header{padding:14px 15px 9px}.sout-card h2{margin:0 0 4px;color:#0b1d3a;font-size:15px}.sout-card header p{margin:0;color:#7a8ba0;font-size:9px}
.sout-form{display:grid;gap:9px;padding:14px}.sout-form label{display:grid;gap:4px;color:#334d6b;font-size:8px;font-weight:800}
.sout-form input,.sout-form select,.sout-form textarea{width:100%;border:1px solid #d6e1ec;border-radius:7px;background:#fff;padding:9px 10px;color:#27425f;font:inherit;font-size:9px}
.sout-form textarea{min-height:72px;resize:vertical}.sout-form-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sout-primary{min-height:38px;border:0;border-radius:8px;background:#166fd8;color:#fff;font-weight:800;font-size:9px;cursor:pointer}
.sout-secondary{min-height:34px;border:1px solid #d6e1ec;border-radius:7px;background:#fff;color:#41617f;font-size:8px;cursor:pointer}
.sout-table-wrap{overflow-x:auto}.sout-table{width:100%;border-collapse:collapse;min-width:950px}
.sout-table th{padding:10px;background:#f5f8fc;border-bottom:1px solid #dfe8f2;color:#5f748e;font-size:8px;text-transform:uppercase;text-align:left;white-space:nowrap}
.sout-table td{padding:10px;border-bottom:1px solid #e8eef5;color:#2c4865;font-size:9px;vertical-align:top}
.sout-table small{display:block;margin-top:3px;color:#8190a3}.sout-actions{display:flex;gap:5px;flex-wrap:wrap}
.sout-status{display:inline-flex;align-items:center;min-height:23px;padding:0 8px;border-radius:999px;font-size:8px;font-weight:800}
.sout-status.planifiee{background:#e8f2ff;color:#2369ae}.sout-status.tenue{background:#e0f8eb;color:#177b4e}.sout-status.reportee{background:#fff0dc;color:#a66616}.sout-status.annulee{background:#fee8ea;color:#b83f49}
.sout-message{padding:10px 12px;border-radius:8px;font-size:9px}.sout-message.success{background:#eefaf3;color:#22744e}.sout-message.error{background:#fff0f2;color:#a23c47}
.sout-report-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sout-report-card{padding:14px;border:1px solid #dfe8f2;border-radius:12px;background:#fff}
.sout-report-card h3{margin:0 0 10px;color:#0c2548;font-size:13px}.sout-report-row{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid #edf1f6;font-size:9px}.sout-report-row:last-child{border-bottom:0}
.sout-filter{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.sout-filter input{height:34px;border:1px solid #d6e1ec;border-radius:7px;padding:0 10px;font-size:9px}
@media(max-width:1050px){.sout-grid{grid-template-columns:1fr}.sout-kpis{grid-template-columns:repeat(2,1fr)}}
@media(max-width:650px){.sout-kpis,.sout-report-grid,.sout-form-row{grid-template-columns:1fr}.sout-hero{flex-direction:column}}
`;

function toArray<T>(
  value: unknown,
): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  const data =
    value as {
      data?: T[];
      items?: T[];
    };

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '—';
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? value
    : date.toLocaleDateString(
        'fr-FR',
      );
}

function statusLabel(
  value: string,
) {
  const labels:
    Record<string, string> = {
      PLANIFIEE:
        'Planifiée',
      TENUE:
        'Tenue',
      REPORTEE:
        'Reportée',
      ANNULEE:
        'Annulée',
    };

  return labels[value] ?? value;
}

function decisionLabel(
  value: string,
) {
  const labels:
    Record<string, string> = {
      EN_ATTENTE:
        'En attente',
      ADMIS:
        'Admis',
      AJOURNE:
        'Ajourné',
      REFUSE:
        'Refusé',
    };

  return labels[value] ?? value;
}

export function SoutenancesPage() {
  const {
    hasPermission,
  } = useAuth();

  const canManage =
    hasPermission(
      'ELIGIBILITE_GERER',
    );

  const canReport =
    hasPermission(
      'REPORTING_CONSULTER',
    );

  const [
    tab,
    setTab,
  ] =
    useState<Tab>(
      'planning',
    );

  const [
    annee,
    setAnnee,
  ] =
    useState('2026-2027');

  const [
    inscriptions,
    setInscriptions,
  ] =
    useState<Inscription[]>([]);

  const [
    classes,
    setClasses,
  ] =
    useState<Classe[]>([]);

  const [
    niveaux,
    setNiveaux,
  ] =
    useState<Niveau[]>([]);

  const [
    formations,
    setFormations,
  ] =
    useState<Formation[]>([]);

  const [
    planning,
    setPlanning,
  ] =
    useState<Soutenance[]>([]);

  const [
    terminees,
    setTerminees,
  ] =
    useState<Soutenance[]>([]);

  const [
    rapport,
    setRapport,
  ] =
    useState<Rapport | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState(emptyForm);

  const [
    editingId,
    setEditingId,
  ] =
    useState<number | null>(
      null,
    );

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
    error,
    setError,
  ] =
    useState('');

  const [
    message,
    setMessage,
  ] =
    useState('');

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const jobs = [
            api<unknown>(
              `/soutenances/planning?annee=${encodeURIComponent(annee)}`,
            ),
            api<unknown>(
              `/soutenances/terminees?annee=${encodeURIComponent(annee)}`,
            ),
            api<unknown>(
              `/soutenances/candidats?annee=${encodeURIComponent(annee)}`,
            ),
            api<unknown>(
              '/classes',
            ),
            api<unknown>(
              '/niveaux',
            ),
            api<unknown>(
              '/formations',
            ),
          ];

          if (canReport) {
            jobs.push(
              api<unknown>(
                `/soutenances/rapport?annee=${encodeURIComponent(annee)}`,
              ),
            );
          }

          const result =
            await Promise.all(
              jobs,
            );

          setPlanning(
            toArray<Soutenance>(
              result[0],
            ),
          );

          setTerminees(
            toArray<Soutenance>(
              result[1],
            ),
          );

          setInscriptions(
            toArray<Inscription>(
              result[2],
            ),
          );

          setClasses(
            toArray<Classe>(
              result[3],
            ),
          );

          setNiveaux(
            toArray<Niveau>(
              result[4],
            ),
          );

          setFormations(
            toArray<Formation>(
              result[5],
            ),
          );

          setRapport(
            canReport
              ? result[6] as Rapport
              : null,
          );
        }
        catch (currentError) {
          setError(
            currentError instanceof
              ApiException
              ? currentError.message
              : 'Chargement des soutenances impossible.',
          );
        }
        finally {
          setLoading(false);
        }
      },
      [
        annee,
        canReport,
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

  function resetForm() {
    setEditingId(
      null,
    );
    setForm(
      emptyForm,
    );
  }

  function getClasse(
    inscription?: Inscription,
  ) {
    if (!inscription) {
      return undefined;
    }

    return (
      inscription.classe ??
      classes.find(
        (item) =>
          item.id ===
          inscription.classeId,
      )
    );
  }

  function getNiveau(
    inscription?: Inscription,
  ) {
    const classe =
      getClasse(
        inscription,
      );

    if (!classe) {
      return undefined;
    }

    return (
      classe.niveau ??
      niveaux.find(
        (item) =>
          item.id ===
          classe.niveauId,
      )
    );
  }

  function getFormation(
    inscription?: Inscription,
  ) {
    const niveau =
      getNiveau(
        inscription,
      );

    if (!niveau) {
      return undefined;
    }

    return (
      niveau.formation ??
      formations.find(
        (item) =>
          item.id ===
          niveau.formationId,
      )
    );
  }

  function inscriptionLabel(
    inscription:
      Inscription,
  ) {
    const etudiant =
      inscription.etudiant;

    const classe =
      getClasse(
        inscription,
      );

    const formation =
      getFormation(
        inscription,
      );

    return [
      etudiant
        ? `${etudiant.matricule} — ${etudiant.prenom} ${etudiant.nom}`
        : `Inscription #${inscription.id}`,
      formation?.nom,
      classe?.nom,
      inscription.anneeAcademique,
    ]
      .filter(Boolean)
      .join(' · ');
  }

  function notify(
    text: string,
  ) {
    setMessage(text);
    setError('');

    window.setTimeout(
      () => setMessage(''),
      2800,
    );
  }

  async function save(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !canManage
    ) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      const payload = {
        inscriptionId:
          Number(
            form.inscriptionId,
          ),

        sujet:
          form.sujet.trim(),

        dateSoutenance:
          form.dateSoutenance,

        heureDebut:
          form.heureDebut ||
          undefined,

        heureFin:
          form.heureFin ||
          undefined,

        lieu:
          form.lieu ||
          undefined,

        statut:
          form.statut,

        decision:
          form.decision,

        note:
          form.note
            ? Number(
                form.note,
              )
            : undefined,

        mention:
          form.mention ||
          undefined,

        numeroPv:
          form.numeroPv ||
          undefined,

        presidentJury:
          form.presidentJury ||
          undefined,

        membresJury:
          form.membresJury ||
          undefined,

        observations:
          form.observations ||
          undefined,
      };

      if (
        editingId
      ) {
        const {
          inscriptionId:
            _inscriptionId,
          ...updatePayload
        } = payload;

        await api(
          `/soutenances/${editingId}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify(
                updatePayload,
              ),
          },
        );

        notify(
          'Soutenance mise à jour.',
        );
      }
      else {
        await api(
          '/soutenances',
          {
            method:
              'POST',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

        notify(
          'Soutenance planifiée.',
        );
      }

      resetForm();

      await load();
    }
    catch (currentError) {
      setError(
        currentError instanceof
          ApiException
          ? currentError.message
          : 'Enregistrement impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  function edit(
    item:
      Soutenance,
  ) {
    setEditingId(
      item.id,
    );

    setForm({
      inscriptionId:
        String(
          item.inscriptionId,
        ),

      sujet:
        item.sujet ?? '',

      dateSoutenance:
        item.dateSoutenance
          ?.slice(
            0,
            10,
          ) ?? '',

      heureDebut:
        item.heureDebut ??
        '',

      heureFin:
        item.heureFin ??
        '',

      lieu:
        item.lieu ??
        '',

      statut:
        item.statut ??
        'PLANIFIEE',

      decision:
        item.decision ??
        'EN_ATTENTE',

      note:
        item.note !== null &&
        item.note !== undefined
          ? String(
              item.note,
            )
          : '',

      mention:
        item.mention ??
        '',

      numeroPv:
        item.numeroPv ??
        '',

      presidentJury:
        item.presidentJury ??
        '',

      membresJury:
        item.membresJury ??
        '',

      observations:
        item.observations ??
        '',
    });

    window.scrollTo({
      top: 0,
      behavior:
        'smooth',
    });
  }

  async function validate(
    item:
      Soutenance,
  ) {
    if (
      item.decision ===
      'EN_ATTENTE'
    ) {
      setError(
        'Renseignez d’abord la décision finale de la soutenance.',
      );

      edit(
        item,
      );

      return;
    }

    if (
      !window.confirm(
        'Valider définitivement cette soutenance ?',
      )
    ) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      await api(
        `/soutenances/${item.id}/valider`,
        {
          method:
            'PATCH',
        },
      );

      notify(
        'Soutenance validée et ajoutée à la liste des soutenances terminées.',
      );

      await load();
    }
    catch (currentError) {
      setError(
        currentError instanceof
          ApiException
          ? currentError.message
          : 'Validation impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  const terminalInscriptions =
    useMemo(
      () =>
        inscriptions
          .filter(
            (item) => {
              const niveau =
                getNiveau(
                  item,
                );

              return (
                niveau?.terminal ===
                  true ||
                item.statut ===
                  'TERMINEE'
              );
            },
          )
          .filter(
            (item) =>
              item.anneeAcademique ===
              annee,
          ),
      [
        inscriptions,
        classes,
        niveaux,
        annee,
      ],
    );

  const totalAdmis =
    terminees.filter(
      (item) =>
        item.decision ===
        'ADMIS',
    ).length;

  if (loading) {
    return (
      <section className="panel">
        Chargement des soutenances...
      </section>
    );
  }

  return (
    <main className="sout-page">
      <style>
        {styles}
      </style>

      <section className="sout-hero">
        <div>
          <h1>
            Soutenances
          </h1>

          <p>
            Organisation, planning, résultats et suivi des soutenances par promotion, classe et formation.
          </p>
        </div>

        <div className="sout-filter">
          <input
            value={annee}
            onChange={
              (event) =>
                setAnnee(
                  event.target.value,
                )
            }
            placeholder="2026-2027"
          />

          <span className="sout-badge">
            Année académique {annee}
          </span>
        </div>
      </section>

      {message && (
        <div className="sout-message success">
          {message}
        </div>
      )}

      {error && (
        <div className="sout-message error">
          {error}
        </div>
      )}

      <section className="sout-kpis">
        <article className="sout-kpi">
          <span>Planifiées</span>
          <strong>{planning.length}</strong>
        </article>

        <article className="sout-kpi">
          <span>Terminées</span>
          <strong>{terminees.length}</strong>
        </article>

        <article className="sout-kpi">
          <span>Admis</span>
          <strong>{totalAdmis}</strong>
        </article>

        <article className="sout-kpi">
          <span>Taux d’admission</span>
          <strong>
            {terminees.length > 0
              ? Math.round(
                  (
                    totalAdmis /
                    terminees.length
                  ) * 100,
                )
              : 0}%
          </strong>
        </article>
      </section>

      <section className="sout-tabs">
        <button
          type="button"
          className={
            tab ===
            'planning'
              ? 'active'
              : ''
          }
          onClick={
            () =>
              setTab(
                'planning',
              )
          }
        >
          Planning
        </button>

        <button
          type="button"
          className={
            tab ===
            'terminees'
              ? 'active'
              : ''
          }
          onClick={
            () =>
              setTab(
                'terminees',
              )
          }
        >
          Soutenances terminées
        </button>

        {canReport && (
          <button
            type="button"
            className={
              tab ===
              'rapport'
                ? 'active'
                : ''
            }
            onClick={
              () =>
                setTab(
                  'rapport',
                )
            }
          >
            Rapport
          </button>
        )}
      </section>

      {tab ===
        'planning' && (
        <section className="sout-grid">
          <article className="sout-card">
            <header>
              <h2>
                Planning des soutenances
              </h2>

              <p>
                Calendrier de la promotion sélectionnée.
              </p>
            </header>

            <div className="sout-table-wrap">
              <table className="sout-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Étudiant</th>
                    <th>Formation / classe</th>
                    <th>Sujet</th>
                    <th>Jury / lieu</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {planning.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        Aucune soutenance planifiée.
                      </td>
                    </tr>
                  ) : (
                    planning.map(
                      (item) => {
                        const inscription =
                          item.inscription;

                        const etudiant =
                          inscription
                            ?.etudiant;

                        const classe =
                          getClasse(
                            inscription,
                          );

                        const formation =
                          getFormation(
                            inscription,
                          );

                        return (
                          <tr key={item.id}>
                            <td>
                              <strong>
                                {formatDate(
                                  item.dateSoutenance,
                                )}
                              </strong>

                              <small>
                                {item.heureDebut ?? '—'}
                                {item.heureFin
                                  ? ` - ${item.heureFin}`
                                  : ''}
                              </small>
                            </td>

                            <td>
                              <strong>
                                {etudiant
                                  ? `${etudiant.prenom} ${etudiant.nom}`
                                  : '—'}
                              </strong>

                              <small>
                                {etudiant?.matricule ?? '—'}
                              </small>
                            </td>

                            <td>
                              {formation?.nom ?? '—'}
                              <small>
                                {classe?.nom ?? '—'} · {inscription?.anneeAcademique ?? '—'}
                              </small>
                            </td>

                            <td>
                              {item.sujet}
                            </td>

                            <td>
                              {item.presidentJury ?? 'Jury non renseigné'}
                              <small>
                                {item.lieu ?? 'Lieu non renseigné'}
                              </small>
                            </td>

                            <td>
                              <span
                                className={
                                  `sout-status ${item.statut.toLowerCase()}`
                                }
                              >
                                {statusLabel(
                                  item.statut,
                                )}
                              </span>
                            </td>

                            <td>
                              <div className="sout-actions">
                                {canManage && (
                                  <>
                                    <button
                                      className="sout-secondary"
                                      type="button"
                                      onClick={
                                        () =>
                                          edit(
                                            item,
                                          )
                                      }
                                    >
                                      Modifier / résultat
                                    </button>

                                    <button
                                      className="sout-secondary"
                                      type="button"
                                      disabled={busy}
                                      onClick={
                                        () =>
                                          void validate(
                                            item,
                                          )
                                      }
                                    >
                                      Valider
                                    </button>
                                  </>
                                )}
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
          </article>

          {canManage && (
            <aside className="sout-card">
              <header>
                <h2>
                  {editingId
                    ? 'Mettre à jour la soutenance'
                    : 'Planifier une soutenance'}
                </h2>

                <p>
                  La promotion, la classe et la formation sont récupérées automatiquement depuis l’inscription.
                </p>
              </header>

              <form
                className="sout-form"
                onSubmit={
                  save
                }
              >
                <label>
                  Étudiant / inscription
                  <select
                    required
                    disabled={
                      !!editingId
                    }
                    value={
                      form.inscriptionId
                    }
                    onChange={
                      (event) =>
                        setForm({
                          ...form,
                          inscriptionId:
                            event.target.value,
                        })
                    }
                  >
                    <option value="">
                      Sélectionner
                    </option>

                    {terminalInscriptions.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {inscriptionLabel(
                            item,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  Sujet
                  <textarea
                    required
                    value={
                      form.sujet
                    }
                    onChange={
                      (event) =>
                        setForm({
                          ...form,
                          sujet:
                            event.target.value,
                        })
                    }
                  />
                </label>

                <div className="sout-form-row">
                  <label>
                    Date
                    <input
                      required
                      type="date"
                      value={
                        form.dateSoutenance
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,
                            dateSoutenance:
                              event.target.value,
                          })
                      }
                    />
                  </label>

                  <label>
                    Lieu / salle
                    <input
                      value={
                        form.lieu
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,
                            lieu:
                              event.target.value,
                          })
                      }
                    />
                  </label>
                </div>

                <div className="sout-form-row">
                  <label>
                    Heure début
                    <input
                      type="time"
                      value={
                        form.heureDebut
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,
                            heureDebut:
                              event.target.value,
                          })
                      }
                    />
                  </label>

                  <label>
                    Heure fin
                    <input
                      type="time"
                      value={
                        form.heureFin
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,
                            heureFin:
                              event.target.value,
                          })
                      }
                    />
                  </label>
                </div>

                <label>
                  Président du jury
                  <input
                    value={
                      form.presidentJury
                    }
                    onChange={
                      (event) =>
                        setForm({
                          ...form,
                          presidentJury:
                            event.target.value,
                        })
                    }
                  />
                </label>

                <label>
                  Membres du jury
                  <textarea
                    value={
                      form.membresJury
                    }
                    onChange={
                      (event) =>
                        setForm({
                          ...form,
                          membresJury:
                            event.target.value,
                        })
                    }
                  />
                </label>

                <div className="sout-form-row">
                  <label>
                    Statut
                    <select
                      value={
                        form.statut
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,
                            statut:
                              event.target.value,
                          })
                      }
                    >
                      <option value="PLANIFIEE">
                        Planifiée
                      </option>
                      <option value="TENUE">
                        Tenue
                      </option>
                      <option value="REPORTEE">
                        Reportée
                      </option>
                      <option value="ANNULEE">
                        Annulée
                      </option>
                    </select>
                  </label>

                  <label>
                    Décision
                    <select
                      value={
                        form.decision
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,
                            decision:
                              event.target.value,
                          })
                      }
                    >
                      <option value="EN_ATTENTE">
                        En attente
                      </option>
                      <option value="ADMIS">
                        Admis
                      </option>
                      <option value="AJOURNE">
                        Ajourné
                      </option>
                      <option value="REFUSE">
                        Refusé
                      </option>
                    </select>
                  </label>
                </div>

                <div className="sout-form-row">
                  <label>
                    Note /20
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.01"
                      value={
                        form.note
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,
                            note:
                              event.target.value,
                          })
                      }
                    />
                  </label>

                  <label>
                    Mention
                    <input
                      placeholder="Ex. Très bien"
                      value={
                        form.mention
                      }
                      onChange={
                        (event) =>
                          setForm({
                            ...form,
                            mention:
                              event.target.value,
                          })
                      }
                    />
                  </label>
                </div>

                <label>
                  Numéro de PV
                  <input
                    value={
                      form.numeroPv
                    }
                    onChange={
                      (event) =>
                        setForm({
                          ...form,
                          numeroPv:
                            event.target.value,
                        })
                    }
                  />
                </label>

                <label>
                  Observations
                  <textarea
                    value={
                      form.observations
                    }
                    onChange={
                      (event) =>
                        setForm({
                          ...form,
                          observations:
                            event.target.value,
                        })
                    }
                  />
                </label>

                <button
                  className="sout-primary"
                  disabled={busy}
                  type="submit"
                >
                  {editingId
                    ? 'Enregistrer les modifications'
                    : 'Ajouter au planning'}
                </button>

                {editingId && (
                  <button
                    className="sout-secondary"
                    type="button"
                    onClick={
                      resetForm
                    }
                  >
                    Annuler
                  </button>
                )}
              </form>
            </aside>
          )}
        </section>
      )}

      {tab ===
        'terminees' && (
        <section className="sout-card">
          <header>
            <h2>
              Étudiants ayant terminé leur soutenance
            </h2>

            <p>
              Cette liste est alimentée automatiquement après validation de la soutenance.
            </p>
          </header>

          <div className="sout-table-wrap">
            <table className="sout-table">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Promotion</th>
                  <th>Classe</th>
                  <th>Formation</th>
                  <th>Année scolaire</th>
                  <th>Note</th>
                  <th>Mention</th>
                  <th>Décision</th>
                  <th>PV</th>
                </tr>
              </thead>

              <tbody>
                {terminees.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      Aucune soutenance terminée pour cette année.
                    </td>
                  </tr>
                ) : (
                  terminees.map(
                    (item) => {
                      const inscription =
                        item.inscription;

                      const etudiant =
                        inscription
                          ?.etudiant;

                      const classe =
                        getClasse(
                          inscription,
                        );

                      const niveau =
                        getNiveau(
                          inscription,
                        );

                      const formation =
                        getFormation(
                          inscription,
                        );

                      return (
                        <tr key={item.id}>
                          <td>
                            <strong>
                              {etudiant
                                ? `${etudiant.prenom} ${etudiant.nom}`
                                : '—'}
                            </strong>
                            <small>
                              {etudiant?.matricule ?? '—'}
                            </small>
                          </td>

                          <td>
                            {niveau?.code ?? '—'} · {inscription?.anneeAcademique ?? '—'}
                          </td>

                          <td>
                            {classe?.nom ?? '—'}
                          </td>

                          <td>
                            {formation?.nom ?? '—'}
                          </td>

                          <td>
                            {inscription?.anneeAcademique ?? '—'}
                          </td>

                          <td>
                            {item.note ?? '—'}
                          </td>

                          <td>
                            {item.mention ?? '—'}
                          </td>

                          <td>
                            {decisionLabel(
                              item.decision,
                            )}
                          </td>

                          <td>
                            {item.numeroPv ?? '—'}
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab ===
        'rapport' &&
        canReport &&
        rapport && (
        <section className="sout-report-grid">
          <article className="sout-report-card">
            <h3>
              Synthèse
            </h3>

            <div className="sout-report-row">
              <span>Total soutenances</span>
              <strong>{rapport.total}</strong>
            </div>

            <div className="sout-report-row">
              <span>Planifiées</span>
              <strong>{rapport.planifiees}</strong>
            </div>

            <div className="sout-report-row">
              <span>Terminées</span>
              <strong>{rapport.terminees}</strong>
            </div>

            <div className="sout-report-row">
              <span>Reportées</span>
              <strong>{rapport.reportees}</strong>
            </div>

            <div className="sout-report-row">
              <span>Annulées</span>
              <strong>{rapport.annulees}</strong>
            </div>
          </article>

          <ReportBlock
            title="Décisions"
            values={
              rapport.parDecision
            }
          />

          <ReportBlock
            title="Par formation"
            values={
              rapport.parFormation
            }
          />

          <ReportBlock
            title="Par classe"
            values={
              rapport.parClasse
            }
          />

          <ReportBlock
            title="Mentions"
            values={
              rapport.parMention
            }
          />
        </section>
      )}
    </main>
  );
}

function ReportBlock({
  title,
  values,
}: {
  title: string;
  values:
    Record<string, number>;
}) {
  const entries =
    Object.entries(
      values,
    );

  return (
    <article className="sout-report-card">
      <h3>
        {title}
      </h3>

      {entries.length === 0 ? (
        <div className="sout-report-row">
          <span>Aucune donnée</span>
          <strong>0</strong>
        </div>
      ) : (
        entries.map(
          ([
            label,
            value,
          ]) => (
            <div
              className="sout-report-row"
              key={label}
            >
              <span>
                {label}
              </span>

              <strong>
                {value}
              </strong>
            </div>
          ),
        )
      )}
    </article>
  );
}
