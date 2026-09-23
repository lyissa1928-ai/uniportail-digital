import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  API_URL,
  api,
  getToken,
} from '../lib/api';

import './legacy-students-admin.page.css';

type Piece = {
  id: number;
  type: string;
  nomOriginal: string;
  mimeType: string;
  tailleOctets: number;
};

type Demande = {
  id: number;
  reference: string;
  email: string;
  telephone: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  matriculeDeclare?: string | null;
  etablissementLibelle: string;
  departementLibelle?: string | null;
  filiereLibelle: string;
  niveauGrade: string;
  anneeEntree: number;
  anneeSortie?: number | null;
  derniereAnneeAcademique: string;
  diplomePrepare: string;
  diplomeObtenu: boolean;
  anneeObtention?: number | null;
  mention?: string | null;
  dejaSoutenu: boolean;
  dateSoutenance?: string | null;
  sujetSoutenance?: string | null;
  directeurMemoire?: string | null;
  presidentJury?: string | null;
  numeroPv?: string | null;
  objetDemande: string;
  detailsDemande?: string | null;
  statut: string;
  motifTraitement?: string | null;
  matriculeVerifie?: string | null;
  traiteePar?: string | null;
  createdAt: string;
  pieces?: Piece[];
  _count?: {
    pieces: number;
  };
  etudiant?: {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    email?: string | null;
  } | null;
};

const statuses = [
  '',
  'SOUMISE',
  'EN_VERIFICATION',
  'COMPLEMENT_REQUIS',
  'VALIDEE',
  'REJETEE',
];

function label(
  value: string,
) {
  const map:
    Record<string, string> = {
      SOUMISE: 'Soumise',
      EN_VERIFICATION: 'En vérification',
      COMPLEMENT_REQUIS: 'Complément requis',
      VALIDEE: 'Validée',
      REJETEE: 'Rejetée',
      RECONSTITUTION_DOSSIER: 'Reconstitution dossier',
      INTEGRATION_PARCOURS: 'Intégration parcours',
      DEMANDE_DIPLOME: 'Demande diplôme',
      ATTESTATION_REUSSITE: 'Attestation réussite',
      RELEVE_NOTES: 'Relevé de notes',
      CORRECTION_DONNEES: 'Correction données',
      AUTRE: 'Autre',
    };

  return map[value] ??
    value.replaceAll(
      '_',
      ' ',
    );
}

export function LegacyStudentsAdminPage() {
  const [
    demandes,
    setDemandes,
  ] =
    useState<Demande[]>([]);

  const [
    selected,
    setSelected,
  ] =
    useState<Demande | null>(
      null,
    );

  const [
    filter,
    setFilter,
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
    motif,
    setMotif,
  ] =
    useState('');

  const [
    matricule,
    setMatricule,
  ] =
    useState('');

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const query =
            filter
              ? '?statut=' +
                encodeURIComponent(
                  filter,
                )
              : '';

          const result =
            await api<Demande[]>(
              '/anciens-etudiants/demandes' +
                query,
            );

          setDemandes(
            result,
          );

          if (
            selected
          ) {
            const refreshed =
              result.find(
                (item) =>
                  item.id ===
                  selected.id,
              );

            if (!refreshed) {
              setSelected(
                null,
              );
            }
          }
        }
        catch (exception) {
          setError(
            exception instanceof
              Error
              ? exception.message
              : 'Chargement impossible.',
          );
        }
        finally {
          setLoading(false);
        }
      },
      [
        filter,
        selected?.id,
      ],
    );

  useEffect(
    () => {
      void load();
    },
    [
      filter,
    ],
  );

  async function select(
    id: number,
  ) {
    setError('');
    setMessage('');

    try {
      const result =
        await api<Demande>(
          '/anciens-etudiants/demandes/' +
            id,
        );

      setSelected(
        result,
      );

      setMatricule(
        result.matriculeVerifie ??
          result.matriculeDeclare ??
          '',
      );

      setMotif(
        result.motifTraitement ??
          '',
      );
    }
    catch (exception) {
      setError(
        exception instanceof
          Error
          ? exception.message
          : 'Lecture impossible.',
      );
    }
  }

  async function action(
    suffix: string,
    body?: unknown,
  ) {
    if (!selected) {
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      await api(
        '/anciens-etudiants/demandes/' +
          selected.id +
          '/' +
          suffix,
        {
          method:
            'PATCH',
          body:
            body
              ? JSON.stringify(
                  body,
                )
              : undefined,
        },
      );

      setMessage(
        'Action enregistrée avec succès.',
      );

      await load();
      await select(
        selected.id,
      );
    }
    catch (exception) {
      setError(
        exception instanceof
          Error
          ? exception.message
          : 'Action impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function download(
    piece: Piece,
  ) {
    if (!selected) {
      return;
    }

    setError('');

    try {
      const headers =
        new Headers();

      const token =
        getToken();

      if (token) {
        headers.set(
          'Authorization',
          'Bearer ' +
            token,
        );
      }

      const response =
        await fetch(
          API_URL +
            '/anciens-etudiants/demandes/' +
            selected.id +
            '/pieces/' +
            piece.id,
          {
            headers,
          },
        );

      if (!response.ok) {
        throw new Error(
          'Téléchargement impossible.',
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          'a',
        );

      anchor.href =
        url;

      anchor.download =
        piece.nomOriginal;

      document.body.appendChild(
        anchor,
      );

      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(
        url,
      );
    }
    catch (exception) {
      setError(
        exception instanceof
          Error
          ? exception.message
          : 'Téléchargement impossible.',
      );
    }
  }

  return (
    <section className="legacy-admin-page">
      <header className="legacy-admin-hero">
        <div>
          <span>
            SCOLARITÉ · ARCHIVES
          </span>
          <h1>
            Anciens étudiants
          </h1>
          <p>
            Vérification des demandes de reconstitution et intégration des anciens parcours.
          </p>
        </div>

        <select
          value={filter}
          onChange={
            (event) =>
              setFilter(
                event.target
                  .value,
              )
          }
        >
          {statuses.map(
            (status) => (
              <option
                key={
                  status ||
                  'ALL'
                }
                value={status}
              >
                {status
                  ? label(
                      status,
                    )
                  : 'Tous les statuts'}
              </option>
            ),
          )}
        </select>
      </header>

      {error && (
        <div className="legacy-admin-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="legacy-admin-alert success">
          {message}
        </div>
      )}

      <div className="legacy-admin-layout">
        <article className="legacy-admin-list">
          <header>
            <h2>
              Demandes
            </h2>
            <span>
              {demandes.length}
            </span>
          </header>

          {loading ? (
            <div className="legacy-admin-empty">
              Chargement...
            </div>
          ) : demandes.length ===
            0 ? (
            <div className="legacy-admin-empty">
              Aucune demande.
            </div>
          ) : (
            <div className="legacy-admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      Référence
                    </th>
                    <th>
                      Étudiant
                    </th>
                    <th>
                      Parcours
                    </th>
                    <th>
                      Objet
                    </th>
                    <th>
                      Statut
                    </th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {demandes.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className={
                          selected?.id ===
                          item.id
                            ? 'selected'
                            : ''
                        }
                      >
                        <td>
                          <strong>
                            {item.reference}
                          </strong>
                          <small>
                            {new Date(
                              item.createdAt,
                            )
                              .toLocaleDateString(
                                'fr-FR',
                              )}
                          </small>
                        </td>

                        <td>
                          {item.prenom}{' '}
                          {item.nom}
                          <small>
                            {item.email}
                          </small>
                        </td>

                        <td>
                          {item.filiereLibelle}
                          <small>
                            {item.niveauGrade} ·{' '}
                            {item.derniereAnneeAcademique}
                          </small>
                        </td>

                        <td>
                          {label(
                            item.objetDemande,
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              'status ' +
                              item.statut
                                .toLowerCase()
                            }
                          >
                            {label(
                              item.statut,
                            )}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={
                              () =>
                                void select(
                                  item.id,
                                )
                            }
                          >
                            Ouvrir
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <aside className="legacy-admin-detail">
          {!selected ? (
            <div className="legacy-admin-empty">
              Sélectionnez une demande pour consulter les informations et les justificatifs.
            </div>
          ) : (
            <>
              <header>
                <div>
                  <span>
                    {selected.reference}
                  </span>
                  <h2>
                    {selected.prenom}{' '}
                    {selected.nom}
                  </h2>
                </div>

                <span
                  className={
                    'status ' +
                    selected.statut
                      .toLowerCase()
                  }
                >
                  {label(
                    selected.statut,
                  )}
                </span>
              </header>

              <section className="detail-grid">
                <div>
                  <span>
                    Matricule déclaré
                  </span>
                  <strong>
                    {selected.matriculeDeclare ??
                      'Non renseigné'}
                  </strong>
                </div>

                <div>
                  <span>
                    Naissance
                  </span>
                  <strong>
                    {new Date(
                      selected.dateNaissance,
                    )
                      .toLocaleDateString(
                        'fr-FR',
                      )}{' '}
                    · {selected.lieuNaissance}
                  </strong>
                </div>

                <div>
                  <span>
                    Contact
                  </span>
                  <strong>
                    {selected.email}
                    <br />
                    {selected.telephone}
                  </strong>
                </div>

                <div>
                  <span>
                    Établissement
                  </span>
                  <strong>
                    {selected.etablissementLibelle}
                  </strong>
                </div>

                <div>
                  <span>
                    Filière
                  </span>
                  <strong>
                    {selected.filiereLibelle}
                  </strong>
                </div>

                <div>
                  <span>
                    Niveau
                  </span>
                  <strong>
                    {selected.niveauGrade}
                  </strong>
                </div>

                <div>
                  <span>
                    Période
                  </span>
                  <strong>
                    {selected.anneeEntree}
                    {' → '}
                    {selected.anneeSortie ??
                      '—'}
                  </strong>
                </div>

                <div>
                  <span>
                    Dernière année
                  </span>
                  <strong>
                    {selected.derniereAnneeAcademique}
                  </strong>
                </div>

                <div className="wide">
                  <span>
                    Diplôme préparé
                  </span>
                  <strong>
                    {selected.diplomePrepare}
                    {selected.diplomeObtenu
                      ? ' · obtenu' +
                        (selected.anneeObtention
                          ? ' en ' +
                            selected.anneeObtention
                          : '')
                      : ''}
                  </strong>
                </div>

                {selected.dejaSoutenu && (
                  <div className="wide">
                    <span>
                      Soutenance
                    </span>
                    <strong>
                      {selected.dateSoutenance
                        ? new Date(
                            selected.dateSoutenance,
                          )
                            .toLocaleDateString(
                              'fr-FR',
                            )
                        : 'Date non renseignée'}
                      {selected.sujetSoutenance
                        ? ' · ' +
                          selected.sujetSoutenance
                        : ''}
                    </strong>
                  </div>
                )}

                <div className="wide">
                  <span>
                    Objet
                  </span>
                  <strong>
                    {label(
                      selected.objetDemande,
                    )}
                  </strong>
                  {selected.detailsDemande && (
                    <p>
                      {selected.detailsDemande}
                    </p>
                  )}
                </div>
              </section>

              <section className="legacy-admin-pieces">
                <h3>
                  Justificatifs
                </h3>

                {(selected.pieces ??
                  []).map(
                  (piece) => (
                    <button
                      key={piece.id}
                      type="button"
                      onClick={
                        () =>
                          void download(
                            piece,
                          )
                      }
                    >
                      <span>
                        {piece.type ===
                        'IDENTITE'
                          ? 'Identité'
                          : 'Académique'}
                      </span>
                      <strong>
                        {piece.nomOriginal}
                      </strong>
                    </button>
                  ),
                )}
              </section>

              {selected.statut !==
                'VALIDEE' &&
                selected.statut !==
                  'REJETEE' && (
                <section className="legacy-admin-actions">
                  {selected.statut !==
                    'EN_VERIFICATION' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={
                        () =>
                          void action(
                            'verifier',
                          )
                      }
                      className="primary"
                    >
                      Mettre en vérification
                    </button>
                  )}

                  {selected.statut ===
                    'EN_VERIFICATION' && (
                    <>
                      <label>
                        Matricule vérifié
                        <input
                          value={matricule}
                          onChange={
                            (event) =>
                              setMatricule(
                                event.target
                                  .value,
                              )
                          }
                          placeholder="Numéro de carte / matricule officiel"
                        />
                      </label>

                      <button
                        type="button"
                        disabled={
                          busy ||
                          !matricule.trim()
                        }
                        onClick={
                          () =>
                            void action(
                              'valider',
                              {
                                matricule:
                                  matricule.trim(),
                              },
                            )
                        }
                        className="success"
                      >
                        Valider et intégrer le dossier
                      </button>
                    </>
                  )}

                  <label>
                    Motif / demande de complément
                    <textarea
                      rows={3}
                      value={motif}
                      onChange={
                        (event) =>
                          setMotif(
                            event.target
                              .value,
                          )
                      }
                    />
                  </label>

                  <div className="action-row">
                    <button
                      type="button"
                      disabled={
                        busy ||
                        !motif.trim()
                      }
                      onClick={
                        () =>
                          void action(
                            'complement',
                            {
                              motif:
                                motif.trim(),
                            },
                          )
                      }
                    >
                      Demander un complément
                    </button>

                    <button
                      type="button"
                      disabled={
                        busy ||
                        !motif.trim()
                      }
                      onClick={
                        () =>
                          void action(
                            'rejeter',
                            {
                              motif:
                                motif.trim(),
                            },
                          )
                      }
                      className="danger"
                    >
                      Rejeter
                    </button>
                  </div>
                </section>
              )}

              {selected.etudiant && (
                <section className="legacy-linked">
                  <span>
                    Dossier officiel rattaché
                  </span>
                  <strong>
                    {selected.etudiant.matricule} ·{' '}
                    {selected.etudiant.prenom}{' '}
                    {selected.etudiant.nom}
                  </strong>
                </section>
              )}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
