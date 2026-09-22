import {
  useEffect,
  useState,
} from 'react';

import type {
  ChangeEvent,
  FormEvent,
} from 'react';

type Classe = {
  id: number;
  nom?: string;
  libelle?: string;
  anneeAcademique?: string;
};

type Etudiant = {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
};

type LigneAnalyse = {
  ligne: number;
  matricule?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  statut?: string;
  erreurs?: string[] | string;
};

type AnalyseImport = {
  total: number;
  valides: number;
  invalides: number;
  lignes: LigneAnalyse[];
};

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3001/api';

function trouverToken(): string | null {
  const storages = [
    window.localStorage,
    window.sessionStorage,
  ];

  const noms = [
    'accessToken',
    'access_token',
    'token',
    'authToken',
    'jwt',
  ];

  for (const storage of storages) {
    for (const nom of noms) {
      const value =
        storage.getItem(nom);

      if (
        value &&
        value.length > 20
      ) {
        return value;
      }
    }

    for (
      let index = 0;
      index < storage.length;
      index++
    ) {
      const key =
        storage.key(index);

      if (!key) {
        continue;
      }

      const raw =
        storage.getItem(key);

      if (!raw) {
        continue;
      }

      if (
        raw.split('.').length === 3 &&
        raw.length > 40
      ) {
        return raw;
      }

      try {
        const data =
          JSON.parse(raw);

        const token =
          data?.accessToken ??
          data?.access_token ??
          data?.token ??
          data?.authToken;

        if (
          typeof token === 'string' &&
          token.length > 20
        ) {
          return token;
        }
      }
      catch {
        // Ce stockage ne contient pas du JSON.
      }
    }
  }

  return null;
}

async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token =
    trouverToken();

  if (!token) {
    throw new Error(
      'Session introuvable. Reconnectez-vous.',
    );
  }

  const headers =
    new Headers(
      options.headers,
    );

  headers.set(
    'Authorization',
    `Bearer ${token}`,
  );

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
      },
    );

  if (!response.ok) {
    let message =
      `Erreur HTTP ${response.status}`;

    try {
      const data =
        await response.json();

      if (
        Array.isArray(data?.message)
      ) {
        message =
          data.message.join(', ');
      }
      else if (data?.message) {
        message =
          data.message;
      }
    }
    catch {
      // Réponse non JSON.
    }

    throw new Error(message);
  }

  return response;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response =
    await authFetch(
      path,
      options,
    );

  return await response.json() as T;
}

export function ScolariteEtudiantsOperations() {
  const [
    classes,
    setClasses,
  ] = useState<Classe[]>([]);

  const [
    etudiants,
    setEtudiants,
  ] = useState<Etudiant[]>([]);

  const [
    fichier,
    setFichier,
  ] = useState<File | null>(null);

  const [
    analyse,
    setAnalyse,
  ] = useState<AnalyseImport | null>(null);

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    erreur,
    setErreur,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    classeImportId,
    setClasseImportId,
  ] = useState('');

  const [
    anneeImport,
    setAnneeImport,
  ] = useState('2026-2027');

  const [
    form,
    setForm,
  ] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    email: '',
    telephone: '',
    classeId: '',
    anneeAcademique:
      '2026-2027',
  });

  async function charger() {
    const [
      listeClasses,
      listeEtudiants,
    ] = await Promise.all([
      request<Classe[]>(
        '/classes',
      ),
      request<Etudiant[]>(
        '/etudiants',
      ),
    ]);

    setClasses(
      listeClasses,
    );

    setEtudiants(
      listeEtudiants,
    );

    if (
      listeClasses.length > 0
    ) {
      const premiere =
        listeClasses[0];

      const id =
        String(
          premiere.id,
        );

      const annee =
        premiere.anneeAcademique ??
        '2026-2027';

      setClasseImportId(
        id,
      );

      setAnneeImport(
        annee,
      );

      setForm(
        (current) => ({
          ...current,
          classeId:
            current.classeId ||
            id,

          anneeAcademique:
            current.anneeAcademique ||
            annee,
        }),
      );
    }
  }

  useEffect(
    () => {
      charger()
        .catch(
          (err: unknown) => {
            setErreur(
              err instanceof Error
                ? err.message
                : 'Chargement impossible.',
            );
          },
        );
    },
    [],
  );

  async function creerEtudiant(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setBusy(true);
    setErreur('');
    setMessage('');

    try {
      const result =
        await request<any>(
          '/etudiants/avec-compte',
          {
            method: 'POST',

            body:
              JSON.stringify({
                matricule:
                  form.matricule.trim(),

                nom:
                  form.nom.trim(),

                prenom:
                  form.prenom.trim(),

                dateNaissance:
                  form.dateNaissance ||
                  undefined,

                email:
                  form.email.trim(),

                telephone:
                  form.telephone.trim() ||
                  undefined,

                classeId:
                  Number(
                    form.classeId,
                  ),

                anneeAcademique:
                  form.anneeAcademique,

                statut:
                  'ACTIVE',
              }),
          },
        );

      const statut =
        result?.acces
          ?.statutEmail;

      if (
        statut ===
        'SMTP_NON_CONFIGURE'
      ) {
        setMessage(
          'Étudiant, inscription et compte créés. SMTP non configuré : les accès n’ont pas encore été envoyés.',
        );
      }
      else {
        setMessage(
          'Étudiant, inscription et compte créés avec succès.',
        );
      }

      setForm(
        (current) => ({
          ...current,
          matricule: '',
          nom: '',
          prenom: '',
          dateNaissance: '',
          email: '',
          telephone: '',
        }),
      );

      await charger();
    }
    catch (err: unknown) {
      setErreur(
        err instanceof Error
          ? err.message
          : 'Création impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function telechargerModele() {
    setErreur('');

    try {
      const response =
        await authFetch(
          '/etudiants/import/template',
        );

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(
          blob,
        );

      const a =
        document.createElement(
          'a',
        );

      a.href = url;
      a.download =
        'modele_import_etudiants.xlsx';

      document.body.appendChild(
        a,
      );

      a.click();
      a.remove();

      URL.revokeObjectURL(
        url,
      );
    }
    catch (err: unknown) {
      setErreur(
        err instanceof Error
          ? err.message
          : 'Téléchargement impossible.',
      );
    }
  }

  function creerFormData() {
    if (!fichier) {
      throw new Error(
        'Sélectionnez un fichier XLSX.',
      );
    }

    if (!classeImportId) {
      throw new Error(
        'Sélectionnez une classe.',
      );
    }

    const data =
      new FormData();

    data.append(
      'fichier',
      fichier,
    );

    data.append(
      'classeId',
      classeImportId,
    );

    data.append(
      'anneeAcademique',
      anneeImport,
    );

    data.append(
      'statut',
      'ACTIVE',
    );

    return data;
  }

  async function analyserImport() {
    setBusy(true);
    setErreur('');
    setMessage('');
    setAnalyse(null);

    try {
      const result =
        await request<AnalyseImport>(
          '/etudiants/import/analyser',
          {
            method: 'POST',
            body:
              creerFormData(),
          },
        );

      setAnalyse(
        result,
      );

      if (
        result.invalides > 0
      ) {
        setMessage(
          'Analyse terminée. Corrigez les lignes invalides avant l’import si nécessaire.',
        );
      }
      else {
        setMessage(
          'Analyse terminée : toutes les lignes sont valides.',
        );
      }
    }
    catch (err: unknown) {
      setErreur(
        err instanceof Error
          ? err.message
          : 'Analyse impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function confirmerImport() {
    if (
      !analyse ||
      analyse.valides <= 0
    ) {
      return;
    }

    setBusy(true);
    setErreur('');
    setMessage('');

    try {
      const result =
        await request<any>(
          '/etudiants/import/confirmer',
          {
            method: 'POST',
            body:
              creerFormData(),
          },
        );

      setMessage(
        `${result?.import?.importes ?? 0} étudiant(s) importé(s), ${result?.import?.echecs ?? 0} échec(s).`,
      );

      setAnalyse(null);
      setFichier(null);

      await charger();
    }
    catch (err: unknown) {
      setErreur(
        err instanceof Error
          ? err.message
          : 'Import impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  async function renvoyerAcces(
    etudiant: Etudiant,
  ) {
    if (!etudiant.email) {
      setErreur(
        'Cet étudiant ne possède pas d’adresse e-mail.',
      );

      return;
    }

    if (
      !window.confirm(
        `Renvoyer les accès à ${etudiant.prenom} ${etudiant.nom} ?`,
      )
    ) {
      return;
    }

    setBusy(true);
    setErreur('');
    setMessage('');

    try {
      await request(
        `/etudiants/${etudiant.id}/renvoyer-acces`,
        {
          method: 'POST',
        },
      );

      setMessage(
        `Accès renvoyés à ${etudiant.email}.`,
      );
    }
    catch (err: unknown) {
      setErreur(
        err instanceof Error
          ? err.message
          : 'Renvoi impossible.',
      );
    }
    finally {
      setBusy(false);
    }
  }

  function choisirFichier(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setFichier(
      event.target.files?.[0] ??
      null,
    );

    setAnalyse(null);
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: 20,
        marginBottom: 24,
      }}
    >
      <section className="card">
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: 16,
            alignItems:
              'flex-start',
            flexWrap:
              'wrap',
          }}
        >
          <div>
            <h2>
              Création avec compte étudiant
            </h2>

            <p>
              Le matricule correspond au numéro de carte étudiant.
              Le compte ETUDIANT et l'inscription sont créés simultanément.
            </p>
          </div>

          <button
            type="button"
            onClick={
              telechargerModele
            }
          >
            Télécharger le modèle Excel
          </button>
        </div>

        {erreur && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
              background:
                '#fef2f2',
              color:
                '#991b1b',
            }}
          >
            {erreur}
          </div>
        )}

        {message && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
              background:
                '#f0fdf4',
              color:
                '#166534',
            }}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={
            creerEtudiant
          }
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 12,
          }}
        >
          <input
            required
            placeholder="Matricule / carte étudiant"
            value={
              form.matricule
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  matricule:
                    e.target.value,
                })
            }
          />

          <input
            required
            placeholder="Nom"
            value={form.nom}
            onChange={
              (e) =>
                setForm({
                  ...form,
                  nom:
                    e.target.value,
                })
            }
          />

          <input
            required
            placeholder="Prénom"
            value={form.prenom}
            onChange={
              (e) =>
                setForm({
                  ...form,
                  prenom:
                    e.target.value,
                })
            }
          />

          <input
            required
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={
              (e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
            }
          />

          <input
            placeholder="Téléphone"
            value={
              form.telephone
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  telephone:
                    e.target.value,
                })
            }
          />

          <input
            type="date"
            value={
              form.dateNaissance
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  dateNaissance:
                    e.target.value,
                })
            }
          />

          <select
            required
            value={
              form.classeId
            }
            onChange={
              (e) => {
                const classe =
                  classes.find(
                    (item) =>
                      String(
                        item.id,
                      ) ===
                      e.target.value,
                  );

                setForm({
                  ...form,
                  classeId:
                    e.target.value,

                  anneeAcademique:
                    classe
                      ?.anneeAcademique ??
                    form.anneeAcademique,
                });
              }
            }
          >
            <option value="">
              Classe
            </option>

            {classes.map(
              (classe) => (
                <option
                  key={
                    classe.id
                  }
                  value={
                    classe.id
                  }
                >
                  {classe.libelle ??
                    classe.nom ??
                    `Classe ${classe.id}`}
                </option>
              ),
            )}
          </select>

          <input
            required
            placeholder="2026-2027"
            value={
              form.anneeAcademique
            }
            onChange={
              (e) =>
                setForm({
                  ...form,
                  anneeAcademique:
                    e.target.value,
                })
            }
          />

          <button
            type="submit"
            disabled={busy}
          >
            {busy
              ? 'Traitement...'
              : 'Créer étudiant + compte'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>
          Import Excel des étudiants
        </h2>

        <p>
          Étape 1 : analyse.
          Étape 2 : vérification des erreurs et doublons.
          Étape 3 : confirmation.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <select
            value={
              classeImportId
            }
            onChange={
              (e) => {
                const id =
                  e.target.value;

                setClasseImportId(
                  id,
                );

                const classe =
                  classes.find(
                    (item) =>
                      String(
                        item.id,
                      ) === id,
                  );

                if (
                  classe
                    ?.anneeAcademique
                ) {
                  setAnneeImport(
                    classe
                      .anneeAcademique,
                  );
                }
              }
            }
          >
            {classes.map(
              (classe) => (
                <option
                  key={
                    classe.id
                  }
                  value={
                    classe.id
                  }
                >
                  {classe.libelle ??
                    classe.nom ??
                    `Classe ${classe.id}`}
                </option>
              ),
            )}
          </select>

          <input
            value={
              anneeImport
            }
            onChange={
              (e) =>
                setAnneeImport(
                  e.target.value,
                )
            }
          />

          <input
            type="file"
            accept=".xlsx"
            onChange={
              choisirFichier
            }
          />

          <button
            type="button"
            disabled={
              busy ||
              !fichier
            }
            onClick={
              analyserImport
            }
          >
            Analyser
          </button>
        </div>

        {analyse && (
          <div>
            <p>
              <strong>
                Total : {analyse.total}
              </strong>
              {' | '}
              Valides : {analyse.valides}
              {' | '}
              Invalides : {analyse.invalides}
            </p>

            <div
              style={{
                overflowX:
                  'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse:
                    'collapse',
                }}
              >
                <thead>
                  <tr>
                    <th>Ligne</th>
                    <th>Matricule</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>E-mail</th>
                    <th>Statut</th>
                    <th>Erreurs</th>
                  </tr>
                </thead>

                <tbody>
                  {analyse.lignes?.map(
                    (ligne) => (
                      <tr
                        key={
                          ligne.ligne
                        }
                      >
                        <td>
                          {ligne.ligne}
                        </td>

                        <td>
                          {ligne.matricule}
                        </td>

                        <td>
                          {ligne.nom}
                        </td>

                        <td>
                          {ligne.prenom}
                        </td>

                        <td>
                          {ligne.email}
                        </td>

                        <td>
                          {ligne.statut}
                        </td>

                        <td>
                          {Array.isArray(
                            ligne.erreurs,
                          )
                            ? ligne.erreurs.join(
                                ', ',
                              )
                            : ligne.erreurs}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              disabled={
                busy ||
                analyse.valides <= 0
              }
              onClick={
                confirmerImport
              }
              style={{
                marginTop: 16,
              }}
            >
              Confirmer l’import
            </button>
          </div>
        )}
      </section>

      <section className="card">
        <h2>
          Gestion des accès étudiants
        </h2>

        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse:
                'collapse',
            }}
          >
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Étudiant</th>
                <th>E-mail</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {etudiants.map(
                (etudiant) => (
                  <tr
                    key={
                      etudiant.id
                    }
                  >
                    <td>
                      {etudiant.matricule}
                    </td>

                    <td>
                      {etudiant.prenom}
                      {' '}
                      {etudiant.nom}
                    </td>

                    <td>
                      {etudiant.email ??
                        '—'}
                    </td>

                    <td>
                      <button
                        type="button"
                        disabled={
                          busy ||
                          !etudiant.email
                        }
                        onClick={
                          () =>
                            renvoyerAcces(
                              etudiant,
                            )
                        }
                      >
                        Renvoyer les accès
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}