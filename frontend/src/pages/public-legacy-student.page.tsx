import {
  useState,
  type FormEvent,
} from 'react';

import {
  Link,
} from 'react-router';

import {
  api,
  ApiException,
} from '../lib/api';

import './public-legacy-student.page.css';

type CreateResult = {
  reference: string;
  statut: string;
  emailEnvoye: boolean;
};

type TrackingResult = {
  reference: string;
  statut: string;
  objetDemande: string;
  motifTraitement?: string | null;
  matriculeVerifie?: string | null;
  dateVerification?: string | null;
  dateDecision?: string | null;
  createdAt: string;
};

const initialForm = {
  email: '',
  telephone: '',
  nom: '',
  prenom: '',
  dateNaissance: '',
  lieuNaissance: '',
  matriculeDeclare: '',
  etablissementLibelle: '',
  departementLibelle: '',
  filiereLibelle: '',
  niveauGrade: '',
  anneeEntree: '',
  anneeSortie: '',
  derniereAnneeAcademique: '',
  diplomePrepare: '',
  diplomeObtenu: 'false',
  anneeObtention: '',
  mention: '',
  dejaSoutenu: 'false',
  dateSoutenance: '',
  sujetSoutenance: '',
  directeurMemoire: '',
  presidentJury: '',
  numeroPv: '',
  attestationReussite: 'false',
  objetDemande: 'RECONSTITUTION_DOSSIER',
  detailsDemande: '',
};

function statusLabel(
  value: string,
) {
  const labels:
    Record<string, string> = {
      SOUMISE:
        'Demande reçue',
      EN_VERIFICATION:
        'En vérification',
      COMPLEMENT_REQUIS:
        'Complément requis',
      VALIDEE:
        'Dossier validé',
      REJETEE:
        'Demande rejetée',
    };

  return labels[value] ??
    value.replaceAll(
      '_',
      ' ',
    );
}

export function PublicLegacyStudentPage() {
  const [
    form,
    setForm,
  ] =
    useState(
      initialForm,
    );

  const [
    identite,
    setIdentite,
  ] =
    useState<File | null>(
      null,
    );

  const [
    pieces,
    setPieces,
  ] =
    useState<File[]>([]);

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
    reference,
    setReference,
  ] =
    useState('');

  const [
    trackingEmail,
    setTrackingEmail,
  ] =
    useState('');

  const [
    tracking,
    setTracking,
  ] =
    useState<TrackingResult | null>(
      null,
    );

  function setField(
    name:
      keyof typeof initialForm,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [name]:
          value,
      }),
    );
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setMessage('');
    setBusy(true);

    try {
      if (!identite) {
        throw new Error(
          'Ajoutez une pièce d’identité.',
        );
      }

      if (
        pieces.length <
        1
      ) {
        throw new Error(
          'Ajoutez au moins une preuve académique.',
        );
      }

      const payload =
        new FormData();

      Object.entries(
        form,
      ).forEach(
        ([key, value]) => {
          if (
            value !== ''
          ) {
            payload.append(
              key,
              value,
            );
          }
        },
      );

      payload.append(
        'identite',
        identite,
      );

      pieces.forEach(
        (file) => {
          payload.append(
            'pieces',
            file,
          );
        },
      );

      const result =
        await api<CreateResult>(
          '/anciens-etudiants/public/demandes',
          {
            method:
              'POST',
            body:
              payload,
          },
        );

      setReference(
        result.reference,
      );

      setTrackingEmail(
        form.email,
      );

      setMessage(
        result.emailEnvoye
          ? 'Votre demande a été enregistrée. Un e-mail de confirmation vous a été envoyé.'
          : 'Votre demande a été enregistrée. Conservez soigneusement la référence affichée.',
      );

      window.scrollTo({
        top: 0,
        behavior:
          'smooth',
      });
    }
    catch (exception) {
      if (
        exception instanceof
        ApiException
      ) {
        const details:
          any =
          exception.details;

        if (
          details?.reference
        ) {
          setReference(
            details.reference,
          );
        }
      }

      setError(
        exception instanceof
          Error
          ? exception.message
          : 'Enregistrement impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function track(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError('');
    setTracking(null);
    setBusy(true);

    try {
      const result =
        await api<TrackingResult>(
          '/anciens-etudiants/public/suivre',
          {
            method:
              'POST',
            body:
              JSON.stringify({
                reference:
                  reference.trim(),
                email:
                  trackingEmail
                    .trim(),
              }),
          },
        );

      setTracking(
        result,
      );
    }
    catch (exception) {
      setError(
        exception instanceof
          Error
          ? exception.message
          : 'Suivi impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  return (
    <main className="legacy-public">
      <header className="legacy-public-header">
        <Link
          to="/"
          className="legacy-brand"
        >
          <strong>
            UniPortail Digital
          </strong>
          <span>
            Dossier ancien étudiant
          </span>
        </Link>

        <div className="legacy-header-actions">
          <Link
            to="/"
          >
            Retour à l’accueil
          </Link>

          <Link
            to="/login"
            className="primary"
          >
            Se connecter
          </Link>
        </div>
      </header>

      <section className="legacy-hero">
        <div>
          <span className="legacy-kicker">
            ANCIEN ÉTUDIANT · ALUMNI
          </span>

          <h1>
            Retrouver et intégrer
            votre ancien dossier
            académique
          </h1>

          <p>
            Ce formulaire est destiné aux anciens étudiants dont le dossier
            n’est pas encore présent dans UniPortail. Les informations
            déclarées restent en attente jusqu’à leur vérification par la
            scolarité.
          </p>
        </div>

        <aside>
          <strong>
            Avant de commencer
          </strong>

          <ol>
            <li>
              Préparez une pièce d’identité valide.
            </li>
            <li>
              Préparez au moins une preuve académique.
            </li>
            <li>
              Si vous connaissez votre ancien matricule, indiquez-le.
            </li>
            <li>
              Conservez la référence reçue après l’envoi.
            </li>
          </ol>
        </aside>
      </section>

      {error && (
        <div className="legacy-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="legacy-alert success">
          {message}
        </div>
      )}

      {reference && (
        <section className="legacy-reference">
          <span>
            Référence de votre demande
          </span>

          <strong>
            {reference}
          </strong>

          <form
            onSubmit={track}
          >
            <input
              required
              type="email"
              value={trackingEmail}
              onChange={
                (event) =>
                  setTrackingEmail(
                    event.target
                      .value,
                  )
              }
              placeholder="Votre adresse e-mail"
            />

            <button
              type="submit"
              disabled={busy}
            >
              Suivre ma demande
            </button>
          </form>

          {tracking && (
            <div className="legacy-tracking">
              <div>
                <span>
                  Statut
                </span>
                <strong>
                  {statusLabel(
                    tracking.statut,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Matricule validé
                </span>
                <strong>
                  {tracking.matriculeVerifie ??
                    'En attente'}
                </strong>
              </div>

              {tracking.motifTraitement && (
                <div className="wide">
                  <span>
                    Information de la scolarité
                  </span>
                  <strong>
                    {tracking.motifTraitement}
                  </strong>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <form
        className="legacy-form"
        onSubmit={submit}
      >
        <section className="legacy-section">
          <div className="legacy-section-head">
            <span>
              01
            </span>
            <div>
              <h2>
                Identité du demandeur
              </h2>
              <p>
                Informations permettant de rapprocher votre demande des archives.
              </p>
            </div>
          </div>

          <div className="legacy-grid">
            <label>
              Nom
              <input
                required
                maxLength={120}
                value={form.nom}
                onChange={
                  (event) =>
                    setField(
                      'nom',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Prénom(s)
              <input
                required
                maxLength={160}
                value={form.prenom}
                onChange={
                  (event) =>
                    setField(
                      'prenom',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Date de naissance
              <input
                required
                type="date"
                value={form.dateNaissance}
                onChange={
                  (event) =>
                    setField(
                      'dateNaissance',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Lieu de naissance
              <input
                required
                maxLength={160}
                value={form.lieuNaissance}
                onChange={
                  (event) =>
                    setField(
                      'lieuNaissance',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Adresse e-mail actuelle
              <input
                required
                type="email"
                value={form.email}
                onChange={
                  (event) =>
                    setField(
                      'email',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Téléphone / WhatsApp
              <input
                required
                value={form.telephone}
                onChange={
                  (event) =>
                    setField(
                      'telephone',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label className="wide">
              Ancien numéro de carte / matricule
              <input
                value={form.matriculeDeclare}
                onChange={
                  (event) =>
                    setField(
                      'matriculeDeclare',
                      event.target
                        .value,
                    )
                }
                placeholder="Facultatif si vous ne le connaissez plus"
              />
            </label>
          </div>
        </section>

        <section className="legacy-section">
          <div className="legacy-section-head">
            <span>
              02
            </span>
            <div>
              <h2>
                Parcours académique
              </h2>
              <p>
                Indiquez les informations connues. Elles seront vérifiées dans les archives.
              </p>
            </div>
          </div>

          <div className="legacy-grid">
            <label>
              Établissement fréquenté
              <input
                required
                value={form.etablissementLibelle}
                onChange={
                  (event) =>
                    setField(
                      'etablissementLibelle',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Département / UFR
              <input
                value={form.departementLibelle}
                onChange={
                  (event) =>
                    setField(
                      'departementLibelle',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Filière / formation
              <input
                required
                value={form.filiereLibelle}
                onChange={
                  (event) =>
                    setField(
                      'filiereLibelle',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Niveau / grade
              <input
                required
                value={form.niveauGrade}
                onChange={
                  (event) =>
                    setField(
                      'niveauGrade',
                      event.target
                        .value,
                    )
                }
                placeholder="Licence, Master, Doctorat, BTS..."
              />
            </label>

            <label>
              Année d’entrée
              <input
                required
                type="number"
                min={1900}
                max={2100}
                value={form.anneeEntree}
                onChange={
                  (event) =>
                    setField(
                      'anneeEntree',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Année de sortie
              <input
                type="number"
                min={1900}
                max={2100}
                value={form.anneeSortie}
                onChange={
                  (event) =>
                    setField(
                      'anneeSortie',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Dernière année académique
              <input
                required
                value={form.derniereAnneeAcademique}
                onChange={
                  (event) =>
                    setField(
                      'derniereAnneeAcademique',
                      event.target
                        .value,
                    )
                }
                placeholder="Ex. 2020-2021"
              />
            </label>

            <label>
              Diplôme préparé
              <input
                required
                value={form.diplomePrepare}
                onChange={
                  (event) =>
                    setField(
                      'diplomePrepare',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Diplôme obtenu ?
              <select
                value={form.diplomeObtenu}
                onChange={
                  (event) =>
                    setField(
                      'diplomeObtenu',
                      event.target
                        .value,
                    )
                }
              >
                <option value="false">
                  Non / non confirmé
                </option>
                <option value="true">
                  Oui
                </option>
              </select>
            </label>

            {form.diplomeObtenu ===
              'true' && (
              <label>
                Année d’obtention
                <input
                  required
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.anneeObtention}
                  onChange={
                    (event) =>
                      setField(
                        'anneeObtention',
                        event.target
                          .value,
                      )
                  }
                />
              </label>
            )}

            <label>
              Mention
              <input
                value={form.mention}
                onChange={
                  (event) =>
                    setField(
                      'mention',
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <label>
              Attestation de réussite disponible ?
              <select
                value={form.attestationReussite}
                onChange={
                  (event) =>
                    setField(
                      'attestationReussite',
                      event.target
                        .value,
                    )
                }
              >
                <option value="false">
                  Non
                </option>
                <option value="true">
                  Oui
                </option>
              </select>
            </label>
          </div>
        </section>

        <section className="legacy-section">
          <div className="legacy-section-head">
            <span>
              03
            </span>
            <div>
              <h2>
                Soutenance
              </h2>
              <p>
                Cette partie apparaît pour les étudiants ayant déjà soutenu.
              </p>
            </div>
          </div>

          <div className="legacy-grid">
            <label>
              Avez-vous déjà soutenu ?
              <select
                value={form.dejaSoutenu}
                onChange={
                  (event) =>
                    setField(
                      'dejaSoutenu',
                      event.target
                        .value,
                    )
                }
              >
                <option value="false">
                  Non
                </option>
                <option value="true">
                  Oui
                </option>
              </select>
            </label>

            {form.dejaSoutenu ===
              'true' && (
              <>
                <label>
                  Date de soutenance
                  <input
                    type="date"
                    value={form.dateSoutenance}
                    onChange={
                      (event) =>
                        setField(
                          'dateSoutenance',
                          event.target
                            .value,
                        )
                    }
                  />
                </label>

                <label className="wide">
                  Sujet du mémoire / projet / thèse
                  <input
                    value={form.sujetSoutenance}
                    onChange={
                      (event) =>
                        setField(
                          'sujetSoutenance',
                          event.target
                            .value,
                        )
                    }
                  />
                </label>

                <label>
                  Directeur / encadreur
                  <input
                    value={form.directeurMemoire}
                    onChange={
                      (event) =>
                        setField(
                          'directeurMemoire',
                          event.target
                            .value,
                        )
                    }
                  />
                </label>

                <label>
                  Président du jury
                  <input
                    value={form.presidentJury}
                    onChange={
                      (event) =>
                        setField(
                          'presidentJury',
                          event.target
                            .value,
                        )
                    }
                  />
                </label>

                <label>
                  Numéro de PV
                  <input
                    value={form.numeroPv}
                    onChange={
                      (event) =>
                        setField(
                          'numeroPv',
                          event.target
                            .value,
                        )
                    }
                  />
                </label>
              </>
            )}
          </div>
        </section>

        <section className="legacy-section">
          <div className="legacy-section-head">
            <span>
              04
            </span>
            <div>
              <h2>
                Objet et justificatifs
              </h2>
              <p>
                Les documents servent uniquement à la vérification par les agents habilités.
              </p>
            </div>
          </div>

          <div className="legacy-grid">
            <label className="wide">
              Objet de la demande
              <select
                value={form.objetDemande}
                onChange={
                  (event) =>
                    setField(
                      'objetDemande',
                      event.target
                        .value,
                    )
                }
              >
                <option value="RECONSTITUTION_DOSSIER">
                  Reconstitution de mon dossier étudiant
                </option>
                <option value="INTEGRATION_PARCOURS">
                  Intégration de mon ancien parcours
                </option>
                <option value="DEMANDE_DIPLOME">
                  Demande de diplôme
                </option>
                <option value="ATTESTATION_REUSSITE">
                  Attestation de réussite
                </option>
                <option value="RELEVE_NOTES">
                  Relevé de notes
                </option>
                <option value="CORRECTION_DONNEES">
                  Correction de données académiques
                </option>
                <option value="AUTRE">
                  Autre
                </option>
              </select>
            </label>

            <label className="wide">
              Précisions
              <textarea
                rows={4}
                maxLength={1200}
                value={form.detailsDemande}
                onChange={
                  (event) =>
                    setField(
                      'detailsDemande',
                      event.target
                        .value,
                    )
                }
                placeholder="Ajoutez toute information utile à la recherche de vos archives."
              />
            </label>

            <label className="wide file-field">
              Pièce d’identité
              <input
                required
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={
                  (event) =>
                    setIdentite(
                      event.target
                        .files?.[0] ??
                        null,
                    )
                }
              />
              <small>
                CNI ou passeport — PDF, JPG ou PNG — 5 Mo maximum.
              </small>
            </label>

            <label className="wide file-field">
              Preuve(s) académique(s)
              <input
                required
                multiple
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={
                  (event) =>
                    setPieces(
                      Array.from(
                        event.target
                          .files ??
                        [],
                      ),
                    )
                }
              />
              <small>
                Carte étudiant, certificat d’inscription, relevé de notes,
                attestation, diplôme, PV de délibération ou PV de soutenance.
                Maximum 6 fichiers, 8 Mo par fichier.
              </small>
            </label>
          </div>
        </section>

        <div className="legacy-consent">
          <strong>
            Déclaration
          </strong>

          <p>
            Je certifie que les informations fournies sont exactes. Je comprends
            que cette demande ne crée pas automatiquement un diplôme, une
            inscription ou un statut académique : seule la validation de la
            scolarité rend le dossier officiel dans UniPortail.
          </p>
        </div>

        <button
          type="submit"
          className="legacy-submit"
          disabled={busy}
        >
          {busy
            ? 'Enregistrement en cours...'
            : 'Soumettre ma demande'}
        </button>
      </form>

      <footer className="legacy-footer">
        © 2026 UniPortail Digital · Service de scolarité
      </footer>
    </main>
  );
}
