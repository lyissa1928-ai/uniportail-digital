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

import { ScolariteEtudiantsOperations } from '../components/scolarite-etudiants-operations';

type Tab =
  | 'etudiants'
  | 'inscriptions'
  | 'parcours';

interface Etudiant {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance?: string | null;
  email?: string | null;
  telephone?: string | null;
  actif: boolean;
}

interface Inscription {
  id: number;
  anneeAcademique: string;
  statut: string;
  dateInscription?: string;
  etudiantId: number;
  classeId: number;
  etudiant?: Etudiant;
  classe?: Classe;
}

interface Classe {
  id: number;
  code: string;
  nom: string;
  annee: string;
  niveauId: number;
  actif: boolean;
}

interface Niveau {
  id: number;
  code: string;
  nom: string;
  formationId: number;
}

interface Formation {
  id: number;
  code: string;
  nom: string;
}

interface EvaluationEligibilite {
  eligible: boolean;
  statut: string;
  motifs: string[];

  inscription: {
    id: number;
    anneeAcademique: string;
    statut: string;
  };

  formation: {
    id: number;
    code: string;
    nom: string;
  };

  niveau: {
    id: number;
    code: string;
    nom: string;
    terminal: boolean;
  };

  classe: {
    id: number;
    code: string;
    nom: string;
  };

  validationAcademique?: {
    decision?: string;
    creditsObtenus?: number;
    creditsRequis?: number;
    stageRequis?: boolean;
    stageValide?: boolean;
    memoireRequis?: boolean;
    memoireValide?: boolean;
    dateDeliberation?: string | null;
  } | null;
}

interface EligibiliteEtudiantResponse {
  evaluations: EvaluationEligibilite[];
}

const emptyEtudiant = {
  matricule: '',
  nom: '',
  prenom: '',
  dateNaissance: '',
  email: '',
  telephone: '',
  actif: true,
};

const emptyInscription = {
  etudiantId: '',
  classeId: '',
  anneeAcademique: '2026-2027',
  statut: 'ACTIVE',
};

function Icon({
  name,
}: {
  name: 'students' | 'active' | 'registration' | 'graduation' | 'school' | 'search';
}) {
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (name === 'students') {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === 'active') {
    return (
      <svg {...common}>
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a6 6 0 0 1 12 0v2M16 11l2 2 4-5" />
      </svg>
    );
  }

  if (name === 'registration') {
    return (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </svg>
    );
  }

  if (name === 'graduation') {
    return (
      <svg {...common}>
        <path d="m2 10 10-5 10 5-10 5z" />
        <path d="M6 12v5c3 2 9 2 12 0v-5" />
      </svg>
    );
  }

  if (name === 'school') {
    return (
      <svg {...common}>
        <path d="m3 10 9-5 9 5-9 5z" />
        <path d="M6 13v5h12v-5M9 18v-3h6v3" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

const pageStyles = `
.sco-premium {
  --sco-navy:#0b1d3a;
  --sco-blue:#1574e8;
  --sco-green:#1cad66;
  --sco-orange:#ff9a32;
  --sco-purple:#8644e8;
  --sco-border:#dfe8f2;
  --sco-muted:#73839a;
  display:grid;
  gap:14px;
  color:#1b3552;
}
.sco-premium *{box-sizing:border-box}
.sco-topline{display:flex;justify-content:flex-end;color:#657b97;font-size:11px}
.sco-hero{display:flex;justify-content:space-between;align-items:center;gap:20px}
.sco-hero-main{display:flex;align-items:center;gap:14px}
.sco-hero-icon{width:58px;height:58px;display:grid;place-items:center;border-radius:14px;background:linear-gradient(135deg,#4096ff,#156fe3);color:#fff;box-shadow:0 12px 26px rgba(21,111,227,.18)}
.sco-hero small{display:block;color:#526c8d;font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px}
.sco-hero h1{margin:0 0 4px;font-size:30px;line-height:1;color:#0b1d3a}
.sco-hero p{margin:0;color:#6d809b;font-size:12px}
.sco-hero-note{min-width:360px;padding:13px 15px;border:1px solid #d8e9fc;border-radius:12px;background:linear-gradient(135deg,#eff7ff,#e8f3ff);color:#2367ad}
.sco-hero-note strong{display:block;font-size:11px;margin-bottom:3px}.sco-hero-note span{font-size:9px;color:#68809b}
.sco-message{padding:10px 12px;border-radius:9px;font-size:10px}.sco-message.success{background:#eefaf3;border:1px solid #c7ead6;color:#23764f}.sco-message.error{background:#fff0f2;border:1px solid #f3c8cd;color:#aa3f49}
.sco-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.sco-kpi{min-height:98px;display:grid;grid-template-columns:56px 1fr;align-items:center;gap:12px;padding:14px;border:1px solid var(--sco-border);border-radius:14px;background:#fff;box-shadow:0 6px 20px rgba(21,46,82,.04)}
.sco-kpi.blue{background:linear-gradient(135deg,#fff,#f0f6ff)}.sco-kpi.green{background:linear-gradient(135deg,#fff,#eefcf3)}.sco-kpi.orange{background:linear-gradient(135deg,#fff,#fff5ea)}.sco-kpi.purple{background:linear-gradient(135deg,#fff,#f8f0ff)}
.sco-kpi-icon{width:52px;height:52px;display:grid;place-items:center;border-radius:13px}.blue .sco-kpi-icon{background:#e6f1ff;color:var(--sco-blue)}.green .sco-kpi-icon{background:#ddf8e8;color:var(--sco-green)}.orange .sco-kpi-icon{background:#fff0dc;color:var(--sco-orange)}.purple .sco-kpi-icon{background:#eee3ff;color:var(--sco-purple)}
.sco-kpi label{display:block;color:#607592;font-size:10px;margin-bottom:2px}.sco-kpi strong{display:block;color:#071a39;font-size:27px;line-height:1.05}.sco-kpi small{color:#71839b;font-size:8px}
.sco-tabsbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 12px;border:1px solid var(--sco-border);border-radius:13px;background:#fff;box-shadow:0 5px 16px rgba(20,48,88,.03)}
.sco-tabs{display:flex;gap:6px}.sco-tabs button{height:38px;padding:0 15px;border:0;border-radius:8px;background:#f5f8fc;color:#607590;font-size:10px;font-weight:750;cursor:pointer}.sco-tabs button.active{background:linear-gradient(135deg,#132f59,#0a1f3f);color:#fff;box-shadow:0 6px 15px rgba(10,32,65,.18)}
.sco-search{width:240px;height:36px;display:flex;align-items:center;gap:7px;padding:0 10px;border:1px solid #d6e1ec;border-radius:8px;color:#55708d}.sco-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:9px;color:#2d4662}
.sco-student-layout{display:grid;grid-template-columns:minmax(0,1fr) 345px;gap:14px;align-items:start}.sco-ops-shell{display:grid;gap:12px}.sco-ops-shell section,.sco-ops-shell article{border:1px solid var(--sco-border)!important;border-radius:13px!important;background:#fff!important;box-shadow:0 5px 18px rgba(20,48,88,.035)!important;padding:15px!important}.sco-ops-shell h2,.sco-ops-shell h3{color:#0c1d3c!important;margin:0 0 6px!important}.sco-ops-shell p{color:#74859e!important}.sco-ops-shell input,.sco-ops-shell select{min-height:38px!important;border:1px solid #d5e0eb!important;border-radius:7px!important;background:#fff!important;padding:0 10px!important}.sco-ops-shell button{min-height:36px!important;border-radius:7px!important;font-weight:750!important}.sco-ops-shell table{width:100%!important;border-collapse:collapse!important}.sco-ops-shell th{background:#f5f8fc!important;color:#59708c!important;font-size:8px!important;text-transform:uppercase!important;padding:10px!important}.sco-ops-shell td{padding:10px!important;border-bottom:1px solid #e8eef5!important;font-size:9px!important}
.sco-card{border:1px solid var(--sco-border);border-radius:13px;background:#fff;box-shadow:0 5px 18px rgba(20,48,88,.035)}
.sco-quick-card{position:sticky;top:14px;padding:15px;background:linear-gradient(180deg,#fff,#fffaff)}.sco-card-heading{display:flex;align-items:center;gap:10px;margin-bottom:14px}.sco-card-heading .badge{width:42px;height:42px;display:grid;place-items:center;border-radius:10px;background:linear-gradient(135deg,#bd55ee,#8534dc);color:#fff;font-size:24px}.sco-card-heading h2{margin:0 0 3px;color:#0a1d3c;font-size:15px}.sco-card-heading p{margin:0;color:#78899f;font-size:8px}
.sco-form{display:grid;gap:10px}.sco-form label{display:grid;gap:5px;color:#263e5b;font-size:9px;font-weight:750}.sco-form input,.sco-form select{width:100%;min-height:38px;border:1px solid #d5e0eb;border-radius:7px;padding:0 10px;background:#fff;color:#2e4661;outline:0;font:inherit;font-size:9px}.sco-form input:focus,.sco-form select:focus{border-color:#79acec;box-shadow:0 0 0 3px rgba(21,116,232,.08)}.sco-check{display:flex!important;align-items:center;gap:7px!important}.sco-check input{width:15px!important;height:15px!important;min-height:0!important;accent-color:#7441df}.sco-primary{min-height:39px;border:0;border-radius:7px;background:linear-gradient(135deg,#7c47ea,#6532d6);color:#fff;font-size:9px;font-weight:800;cursor:pointer}.sco-secondary{min-height:36px;border:1px solid #d6e1ec;border-radius:7px;background:#fff;color:#4c6683;font-size:9px;cursor:pointer}
.sco-management{overflow:hidden}.sco-management header{padding:13px 14px 8px}.sco-management h2{margin:0 0 3px;font-size:15px;color:#0c1d3c}.sco-management p{margin:0;color:#7889a0;font-size:8px}.sco-table-wrap{overflow-x:auto}.sco-table{width:100%;border-collapse:collapse}.sco-table thead{background:#f5f8fc}.sco-table th{padding:10px 11px;border-top:1px solid #e7edf4;border-bottom:1px solid #dde6ef;color:#58708c;text-align:left;font-size:8px;font-weight:850;text-transform:uppercase;white-space:nowrap}.sco-table td{padding:10px 11px;border-bottom:1px solid #e9eef4;color:#2a4562;font-size:9px;vertical-align:middle}.sco-table tbody tr:hover{background:#fafcff}.sco-table-subtitle{display:block;color:#7b8ca1;font-size:8px;margin-top:2px}.sco-status{display:inline-flex;align-items:center;min-height:23px;padding:0 8px;border-radius:999px;font-size:8px;font-weight:800}.sco-status.active{background:#dff7e9;color:#14894f}.sco-status.inactive{background:#fee8eb;color:#bd404c}.sco-actions{display:flex;gap:5px;flex-wrap:wrap}.sco-actions button{min-height:28px;padding:0 9px;border:1px solid #d5e1ed;border-radius:6px;background:#f8fbff;color:#315f8c;font-size:8px;cursor:pointer}.sco-actions .danger{border-color:#f0ccd0;background:#fff1f2;color:#bf3f4b}
.sco-empty{padding:28px;text-align:center;color:#7d8ca0;font-size:10px}.sco-empty strong{display:block;color:#314a67;margin-bottom:4px}
.sco-inscription-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:14px;align-items:start}.sco-inscription-form{padding:15px}.sco-form-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.sco-form-heading h2{margin:0;color:#0c1d3c;font-size:15px}.sco-link{border:0;background:transparent;color:#2568ad;font-size:9px;cursor:pointer}
.sco-profile{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px}.sco-profile-main{min-width:0}.sco-profile h2{margin:3px 0;color:#0b1d3b}.sco-profile p{margin:0;color:#6e819b}.sco-profile-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.sco-profile-meta span{display:inline-flex;align-items:center;min-height:24px;padding:0 8px;border:1px solid #e1e9f2;border-radius:999px;background:#f8fbff;color:#58708c;font-size:8px}.sco-profile-overview{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.sco-profile-stat{padding:13px;border:1px solid var(--sco-border);border-radius:12px;background:#fff;box-shadow:0 4px 14px rgba(20,48,88,.03)}.sco-profile-stat span{display:block;color:#73859d;font-size:8px;text-transform:uppercase;letter-spacing:.05em}.sco-profile-stat strong{display:block;margin-top:4px;color:#0b1d3a;font-size:16px;line-height:1.2}.sco-profile-stat small{display:block;margin-top:4px;color:#8190a4;font-size:8px}.sco-current-card{padding:15px}.sco-current-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.sco-current-heading h3{margin:0 0 3px;color:#0b1d3a;font-size:14px}.sco-current-heading p{margin:0;color:#71849c;font-size:9px}.sco-current-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.sco-current-item{padding:10px;border:1px solid #e5ecf4;border-radius:9px;background:#fafcff}.sco-current-item span{display:block;color:#7a8ba0;font-size:7px;text-transform:uppercase}.sco-current-item strong{display:block;margin-top:3px;color:#203a58;font-size:10px}.sco-eligibility{display:inline-flex;align-items:center;min-height:25px;padding:0 9px;border-radius:999px;font-size:8px;font-weight:800}.sco-eligibility.good{background:#dcf8e8;color:#137b49}.sco-eligibility.warn{background:#fff0df;color:#a86413}.sco-eligibility.neutral{background:#edf2f7;color:#66768a}.sco-timeline{display:grid;gap:10px}.sco-timeline-card{display:grid;grid-template-columns:150px 1fr;gap:14px;padding:14px;border:1px solid var(--sco-border);border-radius:12px;background:#fff}.sco-timeline-year{font-weight:800;color:#245e9b}.sco-timeline-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.sco-timeline-card h3{margin:0 0 4px;color:#0d1e3b}.sco-timeline-card p{margin:0;color:#73849b;font-size:9px}.sco-timeline-meta{display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;color:#627895;font-size:8px}.sco-timeline-flags{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.sco-chip{display:inline-flex;align-items:center;min-height:23px;padding:0 8px;border-radius:999px;background:#f0f4f8;color:#5d7189;font-size:8px;font-weight:750}.sco-chip.good{background:#e1f8eb;color:#167d4e}.sco-chip.warn{background:#fff0df;color:#a66516}.sco-eligibility-reasons{margin:8px 0 0;padding-left:16px;color:#7d5c32;font-size:8px;line-height:1.5}
@media(max-width:1100px){.sco-student-layout,.sco-inscription-layout{grid-template-columns:1fr}.sco-quick-card{position:static}.sco-kpis,.sco-profile-overview,.sco-current-grid{grid-template-columns:repeat(2,1fr)}.sco-hero{align-items:flex-start;flex-direction:column}.sco-hero-note{min-width:0;width:100%}}
@media(max-width:700px){.sco-kpis,.sco-profile-overview,.sco-current-grid{grid-template-columns:1fr}.sco-tabsbar{align-items:stretch;flex-direction:column}.sco-tabs{overflow-x:auto}.sco-search{width:100%}.sco-table{min-width:850px}.sco-profile{align-items:flex-start;flex-direction:column}.sco-timeline-card{grid-template-columns:1fr}}
`;

export function ScolaritePage() {
  const [tab, setTab] = useState<Tab>('etudiants');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingEtudiantId, setEditingEtudiantId] = useState<number | null>(null);
  const [editingInscriptionId, setEditingInscriptionId] = useState<number | null>(null);
  const [selectedEtudiantId, setSelectedEtudiantId] = useState<number | null>(null);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [etudiantForm, setEtudiantForm] = useState(emptyEtudiant);
  const [inscriptionForm, setInscriptionForm] = useState(emptyInscription);
  const [eligibilite, setEligibilite] = useState<EligibiliteEtudiantResponse | null>(null);
  const [eligibiliteLoading, setEligibiliteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [etudiantsData, inscriptionsData, classesData, niveauxData, formationsData] =
        await Promise.all([
          api<Etudiant[]>('/etudiants'),
          api<Inscription[]>('/inscriptions'),
          api<Classe[]>('/classes'),
          api<Niveau[]>('/niveaux'),
          api<Formation[]>('/formations'),
        ]);

      setEtudiants(etudiantsData);
      setInscriptions(inscriptionsData);
      setClasses(classesData);
      setNiveaux(niveauxData);
      setFormations(formationsData);
    }
    catch (err) {
      setError(
        err instanceof ApiException
          ? err.message
          : 'Chargement de la scolarité impossible.',
      );
    }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedEtudiantId) {
      setEligibilite(null);
      setEligibiliteLoading(false);
      return;
    }

    setEligibiliteLoading(true);

    api<EligibiliteEtudiantResponse>(
      `/eligibilite/etudiant/${selectedEtudiantId}`,
    )
      .then((data) => {
        if (!cancelled) {
          setEligibilite(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEligibilite(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setEligibiliteLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedEtudiantId]);

  function notify(text: string) {
    setMessage(text);
    setError('');
    window.setTimeout(() => setMessage(''), 2500);
  }

  function fail(err: unknown) {
    setError(
      err instanceof ApiException
        ? err.message
        : 'Une erreur est survenue.',
    );
  }

  function resetEtudiantForm() {
    setEditingEtudiantId(null);
    setEtudiantForm(emptyEtudiant);
  }

  function resetInscriptionForm() {
    setEditingInscriptionId(null);
    setInscriptionForm(emptyInscription);
  }

  async function saveEtudiant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await api(
        editingEtudiantId
          ? `/etudiants/${editingEtudiantId}`
          : '/etudiants',
        {
          method: editingEtudiantId ? 'PATCH' : 'POST',
          body: JSON.stringify({
            matricule: etudiantForm.matricule,
            nom: etudiantForm.nom,
            prenom: etudiantForm.prenom,
            dateNaissance: etudiantForm.dateNaissance || undefined,
            email: etudiantForm.email || undefined,
            telephone: etudiantForm.telephone || undefined,
            actif: etudiantForm.actif,
          }),
        },
      );

      notify(
        editingEtudiantId
          ? 'Étudiant modifié.'
          : 'Étudiant créé.',
      );

      resetEtudiantForm();
      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function deleteEtudiant(id: number) {
    if (!window.confirm('Supprimer cet étudiant ?')) {
      return;
    }

    try {
      await api(`/etudiants/${id}`, { method: 'DELETE' });
      notify('Étudiant supprimé.');

      if (selectedEtudiantId === id) {
        setSelectedEtudiantId(null);
      }

      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function saveInscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const body = editingInscriptionId
        ? {
            classeId: Number(inscriptionForm.classeId),
            anneeAcademique: inscriptionForm.anneeAcademique,
            statut: inscriptionForm.statut,
          }
        : {
            etudiantId: Number(inscriptionForm.etudiantId),
            classeId: Number(inscriptionForm.classeId),
            anneeAcademique: inscriptionForm.anneeAcademique,
            statut: inscriptionForm.statut,
          };

      await api(
        editingInscriptionId
          ? `/inscriptions/${editingInscriptionId}`
          : '/inscriptions',
        {
          method: editingInscriptionId ? 'PATCH' : 'POST',
          body: JSON.stringify(body),
        },
      );

      notify(
        editingInscriptionId
          ? 'Inscription modifiée.'
          : 'Inscription créée.',
      );

      resetInscriptionForm();
      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  async function deleteInscription(id: number) {
    if (!window.confirm('Supprimer cette inscription ?')) {
      return;
    }

    try {
      await api(`/inscriptions/${id}`, { method: 'DELETE' });
      notify('Inscription supprimée.');
      await load();
    }
    catch (err) {
      fail(err);
    }
  }

  const query = search.trim().toLowerCase();

  const filteredEtudiants = useMemo(
    () =>
      etudiants.filter((item) =>
        [
          item.matricule,
          item.nom,
          item.prenom,
          item.email,
          item.telephone,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query),
      ),
    [etudiants, query],
  );

  const filteredInscriptions = useMemo(
    () =>
      inscriptions.filter((item) => {
        const student =
          item.etudiant ??
          etudiants.find((x) => x.id === item.etudiantId);

        const classe =
          item.classe ??
          classes.find((x) => x.id === item.classeId);

        return [
          student?.matricule,
          student?.nom,
          student?.prenom,
          classe?.code,
          classe?.nom,
          item.anneeAcademique,
          item.statut,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);
      }),
    [inscriptions, etudiants, classes, query],
  );

  const selectedEtudiant = selectedEtudiantId
    ? etudiants.find((item) => item.id === selectedEtudiantId) ?? null
    : null;

  const selectedParcours = selectedEtudiant
    ? inscriptions
        .filter((item) => item.etudiantId === selectedEtudiant.id)
        .sort((a, b) => b.anneeAcademique.localeCompare(a.anneeAcademique))
    : [];

  const selectedCurrentInscription =
    selectedParcours.find(
      (item) => item.statut === 'ACTIVE',
    ) ??
    selectedParcours[0] ??
    null;

  const selectedCompletedCount =
    selectedParcours.filter(
      (item) => item.statut === 'TERMINEE',
    ).length;

  const selectedEvaluation =
    selectedCurrentInscription
      ? eligibilite?.evaluations.find(
          (item) =>
            item.inscription.id ===
            selectedCurrentInscription.id,
        ) ??
        eligibilite?.evaluations[0] ??
        null
      : eligibilite?.evaluations[0] ??
        null;

  function getEtudiant(inscription: Inscription) {
    return (
      inscription.etudiant ??
      etudiants.find((item) => item.id === inscription.etudiantId)
    );
  }

  function getClasse(inscription: Inscription) {
    return (
      inscription.classe ??
      classes.find((item) => item.id === inscription.classeId)
    );
  }

  function getNiveau(classeId: number) {
    const classe = classes.find((item) => item.id === classeId);
    return niveaux.find((item) => item.id === classe?.niveauId);
  }

  function getFormation(classeId: number) {
    const niveau = getNiveau(classeId);
    return formations.find((item) => item.id === niveau?.formationId);
  }

  function openParcours(etudiantId: number) {
    setSelectedEtudiantId(etudiantId);
    setTab('parcours');
    setSearch('');
  }

  const actifs = etudiants.filter((item) => item.actif).length;
  const inscriptionsActives = inscriptions.filter((item) => item.statut === 'ACTIVE').length;
  const terminees = inscriptions.filter((item) => item.statut === 'TERMINEE').length;

  if (loading) {
    return <section className="panel">Chargement de la scolarité...</section>;
  }

  return (
    <div className="sco-premium">
      <style>{pageStyles}</style>

      <div className="sco-topline">Accueil › Scolarité</div>

      <section className="sco-hero">
        <div className="sco-hero-main">
          <span className="sco-hero-icon"><Icon name="school" /></span>
          <div>
            <small>Gestion académique</small>
            <h1>Scolarité</h1>
            <p>Étudiants, inscriptions annuelles et historique du parcours académique.</p>
          </div>
        </div>

        <aside className="sco-hero-note">
          <strong>Accompagner chaque étudiant vers la réussite</strong>
          <span>Une gestion académique simple, performante et structurée.</span>
        </aside>
      </section>

      {message && <div className="sco-message success">{message}</div>}
      {error && <div className="sco-message error">{error}</div>}

      <section className="sco-kpis">
        <article className="sco-kpi blue">
          <span className="sco-kpi-icon"><Icon name="students" /></span>
          <div><label>Étudiants</label><strong>{etudiants.length}</strong><small>Total des étudiants</small></div>
        </article>

        <article className="sco-kpi green">
          <span className="sco-kpi-icon"><Icon name="active" /></span>
          <div><label>Étudiants actifs</label><strong>{actifs}</strong><small>Inscrits cette année</small></div>
        </article>

        <article className="sco-kpi orange">
          <span className="sco-kpi-icon"><Icon name="registration" /></span>
          <div><label>Inscriptions actives</label><strong>{inscriptionsActives}</strong><small>Année en cours</small></div>
        </article>

        <article className="sco-kpi purple">
          <span className="sco-kpi-icon"><Icon name="graduation" /></span>
          <div><label>Parcours terminés</label><strong>{terminees}</strong><small>Parcours finalisés</small></div>
        </article>
      </section>

      <section className="sco-tabsbar">
        <div className="sco-tabs">
          <button type="button" className={tab === 'etudiants' ? 'active' : ''} onClick={() => { setTab('etudiants'); setSearch(''); }}>Étudiants</button>
          <button type="button" className={tab === 'inscriptions' ? 'active' : ''} onClick={() => { setTab('inscriptions'); setSearch(''); }}>Inscriptions</button>
          <button type="button" className={tab === 'parcours' ? 'active' : ''} onClick={() => setTab('parcours')}>Parcours académique</button>
        </div>

        {(tab !== 'parcours' || !selectedEtudiant) && (
          <div className="sco-search">
            <Icon name="search" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher..." />
          </div>
        )}
      </section>

      {tab === 'etudiants' && (
        <>
          <section className="sco-student-layout">
            <div className="sco-ops-shell">
              <ScolariteEtudiantsOperations />
            </div>

            <aside className="sco-card sco-quick-card">
              <div className="sco-card-heading">
                <span className="badge">＋</span>
                <div>
                  <h2>{editingEtudiantId ? 'Modifier l’étudiant' : 'Nouvel étudiant'}</h2>
                  <p>{editingEtudiantId ? 'Mettez à jour le dossier étudiant.' : 'Ajout rapide d’un étudiant.'}</p>
                </div>
              </div>

              <form className="sco-form" onSubmit={saveEtudiant}>
                <label>Matricule<input required value={etudiantForm.matricule} onChange={(event) => setEtudiantForm({ ...etudiantForm, matricule: event.target.value })} /></label>
                <label>Nom<input required value={etudiantForm.nom} onChange={(event) => setEtudiantForm({ ...etudiantForm, nom: event.target.value })} /></label>
                <label>Prénom<input required value={etudiantForm.prenom} onChange={(event) => setEtudiantForm({ ...etudiantForm, prenom: event.target.value })} /></label>
                <label>Date de naissance<input type="date" value={etudiantForm.dateNaissance} onChange={(event) => setEtudiantForm({ ...etudiantForm, dateNaissance: event.target.value })} /></label>
                <label>E-mail<input type="email" value={etudiantForm.email} onChange={(event) => setEtudiantForm({ ...etudiantForm, email: event.target.value })} /></label>
                <label>Téléphone<input value={etudiantForm.telephone} onChange={(event) => setEtudiantForm({ ...etudiantForm, telephone: event.target.value })} /></label>
                <label className="sco-check"><input type="checkbox" checked={etudiantForm.actif} onChange={(event) => setEtudiantForm({ ...etudiantForm, actif: event.target.checked })} />Étudiant actif</label>
                <button className="sco-primary" type="submit">{editingEtudiantId ? 'Enregistrer les modifications' : 'Ajouter l’étudiant'}</button>
                {editingEtudiantId && <button className="sco-secondary" type="button" onClick={resetEtudiantForm}>Annuler</button>}
              </form>
            </aside>
          </section>

          <section className="sco-card sco-management">
            <header>
              <h2>Dossiers étudiants</h2>
              <p>Modification, parcours et suppression des étudiants.</p>
            </header>

            <div className="sco-table-wrap">
              <table className="sco-table">
                <thead><tr><th>Matricule</th><th>Étudiant</th><th>Contact</th><th>État</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredEtudiants.length === 0 ? (
                    <tr><td colSpan={5}><div className="sco-empty"><strong>Aucun étudiant trouvé</strong>Ajoutez un étudiant ou modifiez votre recherche.</div></td></tr>
                  ) : filteredEtudiants.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.matricule}</strong></td>
                      <td><strong>{item.prenom} {item.nom}</strong>{item.dateNaissance && <small className="sco-table-subtitle">Né(e) le {formatDate(item.dateNaissance)}</small>}</td>
                      <td>{item.email ?? '-'}{item.telephone && <small className="sco-table-subtitle">{item.telephone}</small>}</td>
                      <td><span className={item.actif ? 'sco-status active' : 'sco-status inactive'}>{item.actif ? 'Actif' : 'Inactif'}</span></td>
                      <td><div className="sco-actions">
                        <button type="button" onClick={() => openParcours(item.id)}>Parcours</button>
                        <button type="button" onClick={() => { setEditingEtudiantId(item.id); setEtudiantForm({ matricule:item.matricule, nom:item.nom, prenom:item.prenom, dateNaissance:item.dateNaissance ? item.dateNaissance.slice(0,10) : '', email:item.email ?? '', telephone:item.telephone ?? '', actif:item.actif }); window.scrollTo({ top:0, behavior:'smooth' }); }}>Modifier</button>
                        <button type="button" className="danger" onClick={() => void deleteEtudiant(item.id)}>Supprimer</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === 'inscriptions' && (
        <section className="sco-inscription-layout">
          <article className="sco-card sco-management">
            <header><h2>Inscriptions annuelles</h2><p>Gestion des inscriptions par classe et année académique.</p></header>
            <div className="sco-table-wrap">
              <table className="sco-table">
                <thead><tr><th>Étudiant</th><th>Classe</th><th>Formation</th><th>Année</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredInscriptions.length === 0 ? (
                    <tr><td colSpan={6}><div className="sco-empty"><strong>Aucune inscription trouvée</strong></div></td></tr>
                  ) : filteredInscriptions.map((item) => {
                    const student = getEtudiant(item);
                    const classe = getClasse(item);
                    const formation = getFormation(item.classeId);
                    return (
                      <tr key={item.id}>
                        <td><strong>{student?.matricule ?? '-'}</strong><small className="sco-table-subtitle">{student ? `${student.prenom} ${student.nom}` : '-'}</small></td>
                        <td>{classe ? `${classe.code} — ${classe.nom}` : '-'}</td>
                        <td>{formation?.nom ?? '-'}</td>
                        <td>{item.anneeAcademique}</td>
                        <td><InscriptionStatus statut={item.statut} /></td>
                        <td><div className="sco-actions">
                          {student && <button type="button" onClick={() => openParcours(student.id)}>Parcours</button>}
                          <button type="button" onClick={() => { setEditingInscriptionId(item.id); setInscriptionForm({ etudiantId:String(item.etudiantId), classeId:String(item.classeId), anneeAcademique:item.anneeAcademique, statut:item.statut }); }}>Modifier</button>
                          <button type="button" className="danger" onClick={() => void deleteInscription(item.id)}>Supprimer</button>
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="sco-card sco-inscription-form">
            <div className="sco-form-heading">
              <h2>{editingInscriptionId ? 'Modifier inscription' : 'Nouvelle inscription'}</h2>
              {editingInscriptionId && <button type="button" className="sco-link" onClick={resetInscriptionForm}>Annuler</button>}
            </div>

            <form className="sco-form" onSubmit={saveInscription}>
              <label>Étudiant<select required disabled={!!editingInscriptionId} value={inscriptionForm.etudiantId} onChange={(event) => setInscriptionForm({ ...inscriptionForm, etudiantId:event.target.value })}><option value="">Sélectionner</option>{etudiants.filter((item) => item.actif).map((item) => <option key={item.id} value={item.id}>{item.matricule} — {item.prenom} {item.nom}</option>)}</select></label>
              <label>Classe<select required value={inscriptionForm.classeId} onChange={(event) => { const value = event.target.value; const classe = classes.find((item) => item.id === Number(value)); setInscriptionForm({ ...inscriptionForm, classeId:value, anneeAcademique:classe?.annee ?? inscriptionForm.anneeAcademique }); }}><option value="">Sélectionner</option>{classes.filter((item) => item.actif).map((item) => <option key={item.id} value={item.id}>{item.code} — {item.nom} ({item.annee})</option>)}</select></label>
              <label>Année académique<input required value={inscriptionForm.anneeAcademique} onChange={(event) => setInscriptionForm({ ...inscriptionForm, anneeAcademique:event.target.value })} /></label>
              <label>Statut<select value={inscriptionForm.statut} onChange={(event) => setInscriptionForm({ ...inscriptionForm, statut:event.target.value })}><option value="ACTIVE">Active</option><option value="SUSPENDUE">Suspendue</option><option value="ABANDONNEE">Abandonnée</option><option value="TERMINEE">Terminée</option></select></label>
              <button className="sco-primary" type="submit">{editingInscriptionId ? 'Enregistrer' : 'Inscrire'}</button>
            </form>
          </aside>
        </section>
      )}

      {tab === 'parcours' && (
        <section className="sco-timeline">
          {!selectedEtudiant && (
            <article className="sco-card sco-management">
              <header><h2>Choisir un étudiant</h2><p>Ouvrez le parcours depuis la liste des dossiers étudiants.</p></header>
              <div className="sco-table-wrap">
                <table className="sco-table"><thead><tr><th>Matricule</th><th>Étudiant</th><th>Action</th></tr></thead><tbody>{filteredEtudiants.map((item) => <tr key={item.id}><td>{item.matricule}</td><td>{item.prenom} {item.nom}</td><td><div className="sco-actions"><button type="button" onClick={() => openParcours(item.id)}>Voir le parcours</button></div></td></tr>)}</tbody></table>
              </div>
            </article>
          )}

          {selectedEtudiant && (
            <>
              <section className="sco-card sco-profile">
                <div className="sco-profile-main">
                  <small>DOSSIER ÉTUDIANT</small>
                  <h2>{selectedEtudiant.prenom} {selectedEtudiant.nom}</h2>

                  <div className="sco-profile-meta">
                    <span>Matricule : {selectedEtudiant.matricule}</span>
                    <span>{selectedEtudiant.email ?? 'E-mail non renseigné'}</span>
                    <span>{selectedEtudiant.telephone ?? 'Téléphone non renseigné'}</span>
                    {selectedEtudiant.dateNaissance && (
                      <span>Né(e) le {formatDate(selectedEtudiant.dateNaissance)}</span>
                    )}
                    <span>{selectedEtudiant.actif ? 'Étudiant actif' : 'Étudiant inactif'}</span>
                  </div>
                </div>

                <div className="sco-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setInscriptionForm({
                        ...emptyInscription,
                        etudiantId: String(selectedEtudiant.id),
                      });
                      setTab('inscriptions');
                    }}
                  >
                    Nouvelle inscription
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedEtudiantId(null)}
                  >
                    Fermer
                  </button>
                </div>
              </section>

              <section className="sco-profile-overview">
                <article className="sco-profile-stat">
                  <span>Inscriptions</span>
                  <strong>{selectedParcours.length}</strong>
                  <small>Historique académique</small>
                </article>

                <article className="sco-profile-stat">
                  <span>Parcours terminés</span>
                  <strong>{selectedCompletedCount}</strong>
                  <small>Années finalisées</small>
                </article>

                <article className="sco-profile-stat">
                  <span>Situation actuelle</span>
                  <strong>
                    {selectedCurrentInscription
                      ? getNiveau(selectedCurrentInscription.classeId)?.nom ?? 'Niveau'
                      : 'Non inscrit'}
                  </strong>
                  <small>
                    {selectedCurrentInscription
                      ? selectedCurrentInscription.anneeAcademique
                      : 'Aucune inscription'}
                  </small>
                </article>

                <article className="sco-profile-stat">
                  <span>Éligibilité diplôme</span>
                  <strong>
                    {eligibiliteLoading
                      ? 'Vérification...'
                      : selectedEvaluation
                        ? selectedEvaluation.eligible
                          ? 'Éligible'
                          : 'Non éligible'
                        : 'Non évaluée'}
                  </strong>
                  <small>
                    {selectedEvaluation?.niveau.terminal
                      ? 'Niveau terminal'
                      : 'Selon le parcours terminal'}
                  </small>
                </article>
              </section>

              {selectedCurrentInscription && (
                <section className="sco-card sco-current-card">
                  <div className="sco-current-heading">
                    <div>
                      <h3>Situation académique actuelle</h3>
                      <p>Dernière inscription connue dans le parcours étudiant.</p>
                    </div>

                    <InscriptionStatus statut={selectedCurrentInscription.statut} />
                  </div>

                  <div className="sco-current-grid">
                    <div className="sco-current-item">
                      <span>Formation</span>
                      <strong>
                        {getFormation(selectedCurrentInscription.classeId)?.nom ?? '-'}
                      </strong>
                    </div>

                    <div className="sco-current-item">
                      <span>Niveau</span>
                      <strong>
                        {getNiveau(selectedCurrentInscription.classeId)?.nom ?? '-'}
                      </strong>
                    </div>

                    <div className="sco-current-item">
                      <span>Classe</span>
                      <strong>
                        {getClasse(selectedCurrentInscription)?.nom ?? '-'}
                      </strong>
                    </div>

                    <div className="sco-current-item">
                      <span>Année académique</span>
                      <strong>{selectedCurrentInscription.anneeAcademique}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    {eligibiliteLoading ? (
                      <span className="sco-eligibility neutral">
                        Vérification de l’éligibilité...
                      </span>
                    ) : selectedEvaluation ? (
                      <span
                        className={
                          selectedEvaluation.eligible
                            ? 'sco-eligibility good'
                            : 'sco-eligibility warn'
                        }
                      >
                        {selectedEvaluation.eligible
                          ? 'Éligible au diplôme'
                          : 'Non éligible au diplôme'}
                      </span>
                    ) : (
                      <span className="sco-eligibility neutral">
                        Éligibilité non évaluée pour cette inscription
                      </span>
                    )}
                  </div>
                </section>
              )}

              {selectedParcours.length === 0 ? (
                <article className="sco-card sco-empty">
                  <strong>Aucun parcours académique enregistré.</strong>
                </article>
              ) : selectedParcours.map((item) => {
                const classe = getClasse(item);
                const niveau = getNiveau(item.classeId);
                const formation = getFormation(item.classeId);
                const evaluation =
                  eligibilite?.evaluations.find(
                    (entry) =>
                      entry.inscription.id === item.id,
                  );

                return (
                  <article className="sco-timeline-card" key={item.id}>
                    <div className="sco-timeline-year">
                      {item.anneeAcademique}
                    </div>

                    <div>
                      <div className="sco-timeline-head">
                        <div>
                          <h3>{formation?.nom ?? 'Formation'}</h3>
                          <p>{niveau?.nom ?? '-'} · {classe?.nom ?? '-'}</p>
                        </div>

                        <InscriptionStatus statut={item.statut} />
                      </div>

                      <div className="sco-timeline-meta">
                        <span>Classe : {classe?.code ?? '-'}</span>
                        <span>Niveau : {niveau?.code ?? '-'}</span>
                        <span>Formation : {formation?.code ?? '-'}</span>
                        {item.dateInscription && (
                          <span>Inscription : {formatDate(item.dateInscription)}</span>
                        )}
                      </div>

                      <div className="sco-timeline-flags">
                        {niveau?.terminal && (
                          <span className="sco-chip">Niveau terminal</span>
                        )}

                        {evaluation && (
                          <span
                            className={
                              evaluation.eligible
                                ? 'sco-chip good'
                                : 'sco-chip warn'
                            }
                          >
                            {evaluation.eligible
                              ? 'Éligible au diplôme'
                              : 'Non éligible'}
                          </span>
                        )}

                        {evaluation?.validationAcademique && (
                          <span className="sco-chip">
                            Crédits : {evaluation.validationAcademique.creditsObtenus ?? 0}
                            /{evaluation.validationAcademique.creditsRequis ?? 0}
                          </span>
                        )}

                        {evaluation?.validationAcademique?.memoireRequis && (
                          <span
                            className={
                              evaluation.validationAcademique.memoireValide
                                ? 'sco-chip good'
                                : 'sco-chip warn'
                            }
                          >
                            Mémoire {evaluation.validationAcademique.memoireValide ? 'validé' : 'non validé'}
                          </span>
                        )}

                        {evaluation?.validationAcademique?.stageRequis && (
                          <span
                            className={
                              evaluation.validationAcademique.stageValide
                                ? 'sco-chip good'
                                : 'sco-chip warn'
                            }
                          >
                            Stage {evaluation.validationAcademique.stageValide ? 'validé' : 'non validé'}
                          </span>
                        )}
                      </div>

                      {evaluation && !evaluation.eligible && evaluation.motifs.length > 0 && (
                        <ul className="sco-eligibility-reasons">
                          {evaluation.motifs.slice(0, 4).map((motif) => (
                            <li key={motif}>
                              {eligibilityReasonLabel(motif)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                );
              })}
            </>
          )}
        </section>
      )}
    </div>
  );
}

function InscriptionStatus({ statut }: { statut: string }) {
  const normalized = statut.toLowerCase();

  const labels: Record<string, string> = {
    ACTIVE: 'Active',
    SUSPENDUE: 'Suspendue',
    ABANDONNEE: 'Abandonnée',
    TERMINEE: 'Terminée',
  };

  return (
    <span
      className={`sco-status ${
        normalized === 'active' || normalized === 'terminee'
          ? 'active'
          : 'inactive'
      }`}
    >
      {labels[statut] ?? statut}
    </span>
  );
}

function eligibilityReasonLabel(code: string) {
  const labels: Record<string, string> = {
    NIVEAU_NON_TERMINAL:
      'Le niveau n’est pas terminal.',
    INSCRIPTION_NON_TERMINEE:
      'L’inscription doit être terminée.',
    VALIDATION_ACADEMIQUE_ABSENTE:
      'La validation académique est absente.',
    DECISION_ACADEMIQUE_NON_ADMISE:
      'La décision académique n’est pas ADMIS.',
    CREDITS_INSUFFISANTS:
      'Le nombre de crédits requis n’est pas atteint.',
    STAGE_NON_VALIDE:
      'Le stage requis n’est pas validé.',
    MEMOIRE_NON_VALIDE:
      'Le mémoire requis n’est pas validé.',
    DATE_DELIBERATION_ABSENTE:
      'La date de délibération est absente.',
  };

  return labels[code] ?? code;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}
