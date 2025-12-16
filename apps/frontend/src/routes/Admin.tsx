// apps/frontend/src/routes/Admin.tsx

import { FormEvent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFriendlyErrorMessage } from '../lib/errors';

// ✅ chemins réels (depuis src/routes → remonter d’un cran puis aller dans lib/)
import { parseCSV } from '../lib/csv';
import { saveQuestions } from '../lib/db.indexeddb';
import { useSettings } from '../lib/settings';


// ⛔️ NE PAS déclarer un autre "export default function Admin()" dans ce fichier.
//     Il ne doit y avoir QU’UNE SEULE déclaration/export par défaut.

export default function Admin() {
  const [settings, setSettings] = useSettings();
  const [report, setReport] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [teacherPhoto, setTeacherPhoto] = useState(settings.teacherPhotoUrl);
  const [summary, setSummary] = useState(settings.courseSummary);

  const api = import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

  // Charger les paramètres distants au montage
  useEffect(() => {
    fetch(`${api}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.teacherPhotoUrl) setTeacherPhoto(data.teacherPhotoUrl);
        if (data.courseSummary) setSummary(data.courseSummary);
        // Mettre à jour le store local aussi pour la cohérence
        setSettings({
          teacherPhotoUrl: data.teacherPhotoUrl || settings.teacherPhotoUrl,
          courseSummary: data.courseSummary || settings.courseSummary
        });
      })
      .catch(err => console.error('Erreur chargement settings:', err));
  }, []);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const { questions, errors } = parseCSV(text);

      if (import.meta.env.VITE_STORAGE === 'indexeddb') {
        // Stockage local navigateur
        await saveQuestions(questions);
        setReport(errors.length ? errors : ['Import réussi dans IndexedDB !']);
      } else {
        // Appel backend → import en base
        const formData = new FormData();
        formData.append('quizFile', file);
        formData.append('securityCode', code);

        const response = await fetch(`${api}/api/questions/import`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setReport(['Import réussi via le backend !', `Questions insérées : ${result.inserted}`]);
      }
    } catch (error) {
      const message = getFriendlyErrorMessage(error);
      setReport([`Import impossible : ${message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSaveSettings = async (event: FormEvent) => {
    event.preventDefault();
    if (!authorized) return;

    setIsSaving(true);
    // 1. Sauvegarde locale (photo, résumé)
    const patch: any = { teacherPhotoUrl: teacherPhoto, courseSummary: summary };
    setSettings(patch);
    const msgs = ['Paramètres visuels sauvegardés localement.'];

    // 1b. Sauvegarde distante (Backend)
    try {
      const res = await fetch(`${api}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherPhotoUrl: teacherPhoto, courseSummary: summary })
      });
      if (res.ok) {
        msgs.push('Paramètres sauvegardés sur le serveur.');
      } else {
        msgs.push('Erreur lors de la sauvegarde sur le serveur.');
      }
    } catch (e) {
      console.error(e);
      msgs.push('Impossible de contacter le serveur pour la sauvegarde.');
    }

    // 2. Sauvegarde du code (Backend)
    if (newCode.trim()) {
      if (!/^\d{6}$/.test(newCode.trim())) {
        setReport([...msgs, 'Erreur : Le code doit contenir 6 chiffres.']);
        setIsSaving(false);
        return;
      }

      try {
        const res = await fetch(`${api}/api/settings/change-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldCode: code, newCode: newCode.trim() })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Erreur lors du changement de code');
        }

        msgs.push('Nouveau code de sécurité enregistré avec succès.');
        setCode(newCode.trim()); // Met à jour le code actuel pour rester connecté
        setNewCode('');
      } catch (e: any) {
        // Afficher l'erreur détaillée si disponible (pour le debug)
        const detail = e.message || 'Erreur inconnue';
        msgs.push(`Erreur technique : ${detail}`);
        console.error('Change code error:', e);
      }
    }

    setReport(msgs);
    setIsSaving(false);
  };

  const onUploadTeacherPhoto = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setTeacherPhoto(dataUrl);
      setReport(["Photo du professeur importée depuis l'ordinateur (stockée localement)."]);
    };
    reader.readAsDataURL(file);
  };

  const onSubmitCode = async (event: FormEvent) => {
    event.preventDefault();

    // Vérification via Backend
    try {
      const res = await fetch(`${api}/api/settings/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (data.valid) {
        setAuthorized(true);
        setReport(['Code accepté. Vous pouvez importer un fichier.']);
      } else {
        setAuthorized(false);
        setReport(['Code incorrect.']);
      }
    } catch (e) {
      console.error(e);
      // Fallback local si backend injoignable (pour dev indexeddb)
      if (code === settings.adminCode) {
        setAuthorized(true);
        setReport(['Code accepté (Mode hors-ligne).']);
      } else {
        setAuthorized(false);
        setReport(['Erreur de vérification.']);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8 rounded-[2.75rem] surface-dark p-8 shadow-2xl">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Espace sécurisé</p>
            <h1 className="text-3xl font-extrabold text-white">Maintenance & Import CSV</h1>
            <p className="mt-2 text-slate-300">
              Protégez l&apos;accès au contenu pédagogique grâce à votre code formateur.
            </p>
          </div>
          <Link to="/" className="btn-red whitespace-nowrap">Retour à l'accueil</Link>
        </header>

        {/* Étape 1 - Code formateur */}
        <section className="rounded-3xl bg-gray-800/70 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-100">Étape 1 - Vérification</h2>
          <form onSubmit={onSubmitCode} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Code de sécurité
              </span>
              <input
                type="password"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-dark mt-2 w-full rounded-2xl px-4 py-3 text-lg tracking-[0.4em] shadow-inner"
                placeholder="000000"
                aria-label="Code de sécurité"
              />
            </label>
            <div className="sm:self-end">
              <button type="submit" className="btn-red w-full sm:w-auto">Valider</button>
            </div>
          </form>
        </section>

        {/* Étape 2 - Import CSV */}
        <section
          className={`rounded-3xl p-6 shadow-lg ${authorized ? 'bg-gray-800/70' : 'bg-gray-800/50 opacity-70'}`}
          aria-disabled={!authorized}
        >
          <h2 className="text-xl font-semibold text-slate-100">Étape 2 - Importer votre fichier CSV</h2>
          <p className="mt-2 text-slate-300">
            Sélectionnez le fichier exporté depuis votre tableur (UTF-8). Les anciennes questions seront remplacées.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (!authorized || !e.target.files) return;
                const file = e.target.files[0];
                if (file) handleFile(file);
              }}
              className="w-full rounded-2xl border border-dashed border-gray-600 bg-gray-900/70 px-4 py-6 text-center text-slate-300 shadow-inner"
              disabled={!authorized || isLoading}
            />
            <button type="button" disabled={!authorized || isLoading} className="btn-red">
              Importer
            </button>
          </div>
          {isLoading && <p className="mt-2 text-sm text-slate-400">Importation en cours…</p>}
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {report.map((item, index) => (
              <li key={`${item}-${index}`} className="rounded-2xl bg-gray-900/60 px-4 py-2 shadow">
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Étape 3 - Paramètres visuels */}
        <section
          className={`rounded-3xl p-6 shadow-lg ${authorized ? 'bg-gray-800/70' : 'bg-gray-800/50 opacity-70'}`}
          aria-disabled={!authorized}
        >
          <h2 className="text-xl font-semibold text-slate-100">Étape 3 - Paramètres</h2>
          <form onSubmit={onSaveSettings} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Photo du professeur (URL)
              </span>
              <input
                type="url"
                value={teacherPhoto}
                onChange={(e) => setTeacherPhoto(e.target.value)}
                className="input-dark mt-2 w-full rounded-2xl px-4 py-3 text-sm shadow-inner"
                placeholder="https://..."
                disabled={!authorized}
              />
            </label>

            <div className="sm:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Ou importer une image locale
              </span>
              <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="file"
                  accept="image/*"
                  disabled={!authorized}
                  onChange={(e) => onUploadTeacherPhoto(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  className="w-full rounded-2xl border border-dashed border-gray-600 bg-gray-900/70 px-4 py-3 text-slate-300 shadow-inner"
                />
                <button type="button" disabled={!authorized} className="btn-red" onClick={() => setTeacherPhoto('')}>
                  Effacer
                </button>
              </div>
            </div>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Nouveau code d&apos;accès (6 chiffres)
              </span>
              <input
                type="password"
                inputMode="numeric"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="input-dark mt-2 w-full rounded-2xl px-4 py-3 text-lg tracking-[0.4em] shadow-inner"
                placeholder="000000"
                disabled={!authorized}
              />
              <p className="mt-1 text-xs text-slate-400">Laissez vide pour conserver le code actuel.</p>
            </label>

            <div className="sm:self-end sm:col-span-2">
              <button type="submit" disabled={!authorized || isSaving} className="btn-red w-full flex items-center justify-center gap-2">
                {isSaving ? (
                  <>
                    <span className="animate-spin text-xl">⏳</span> Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
