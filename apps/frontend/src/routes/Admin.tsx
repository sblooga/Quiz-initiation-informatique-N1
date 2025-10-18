import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { parseCSV } from '../lib/csv';
import { saveQuestions } from '../lib/db.indexeddb';
import { useSettings } from '../lib/settings';

export default function Admin() {
  const [settings, setSettings] = useSettings();
  const [report, setReport] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [teacherPhoto, setTeacherPhoto] = useState(settings.teacherPhotoUrl);
  const [summary, setSummary] = useState(settings.courseSummary);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const { questions, errors } = parseCSV(text);

      if (import.meta.env.VITE_STORAGE === 'indexeddb') {
        await saveQuestions(questions);
        setReport(errors.length ? errors : ['Import réussi dans IndexedDB !']);
      } else {
        const response = await fetch('http://localhost:3001/questions/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setReport(errors.length ? errors : ['Import réussi dans NocoDB !']);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setReport([`Import impossible : ${message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSaveSettings = (event: FormEvent) => {
    event.preventDefault();
    if (!authorized) return;
    const patch: any = { teacherPhotoUrl: teacherPhoto, courseSummary: summary };
    if (newCode.trim()) {
      if (!/^\d{5}$/.test(newCode.trim())) {
        setReport(["Le code doit contenir 5 chiffres."]);
        return;
      }
      patch.adminCode = newCode.trim();
    }
    setSettings(patch);
    setReport(["Paramètres sauvegardés."]);
    setNewCode('');
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

  const onSubmitCode = (event: FormEvent) => {
    event.preventDefault();
    if (code.trim() === settings.adminCode) {
      setAuthorized(true);
      setReport(['Code accepté. Vous pouvez importer un fichier.']);
    } else {
      setAuthorized(false);
      setReport(["Code incorrect. Merci de vérifier auprès du formateur."]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8 rounded-[2.75rem] surface-dark p-8 shadow-2xl">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Espace sécurisé</p>
            <h1 className="text-3xl font-extrabold text-white">Maintenance & Import CSV</h1>
            <p className="mt-2 text-slate-300">Protégez l'accès au contenu pédagogique grâce à votre code formateur.</p>
          </div>
          <Link to="/" className="btn-red">Retour</Link>
        </header>

        <section className="rounded-3xl bg-gray-800/70 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-100">Étape 1 - Vérification</h2>
          <form onSubmit={onSubmitCode} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Code de sécurité</span>
              <input
                type="password"
                inputMode="numeric"
                value={code}
                onChange={event => setCode(event.target.value)}
                className="input-dark mt-2 w-full rounded-2xl px-4 py-3 text-lg tracking-[0.4em] shadow-inner"
                placeholder="00000"
                aria-label="Code de sécurité"
              />
            </label>
            <div className="sm:self-end">
              <button type="submit" className="btn-red w-full sm:w-auto">Valider</button>
            </div>
          </form>
        </section>

        <section className={`rounded-3xl p-6 shadow-lg ${authorized ? 'bg-gray-800/70' : 'bg-gray-800/50 opacity-70'}`} aria-disabled={!authorized}>
          <h2 className="text-xl font-semibold text-slate-100">Étape 2 - Importer votre fichier CSV</h2>
          <p className="mt-2 text-slate-300">Sélectionnez le fichier exporté depuis votre tableur (format UTF-8). Les anciennes questions seront remplacées.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
            <input
              type="file"
              accept=".csv"
              onChange={event => {
                if (!authorized || !event.target.files) return;
                const file = event.target.files[0];
                if (file) handleFile(file);
              }}
              className="w-full rounded-2xl border border-dashed border-gray-600 bg-gray-900/70 px-4 py-6 text-center text-slate-300 shadow-inner"
              disabled={!authorized || isLoading}
            />
            <button type="button" disabled={!authorized || isLoading} className="btn-red">Importer</button>
          </div>
          {isLoading && <p className="mt-2 text-sm text-slate-400">Importation en cours...</p>}
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {report.map((item, index) => (
              <li key={`${item}-${index}`} className="rounded-2xl bg-gray-900/60 px-4 py-2 shadow">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className={`rounded-3xl p-6 shadow-lg ${authorized ? 'bg-gray-800/70' : 'bg-gray-800/50 opacity-70'}`} aria-disabled={!authorized}>
          <h2 className="text-xl font-semibold text-slate-100">Étape 3 - Paramètres de la page d'accueil</h2>
          <form onSubmit={onSaveSettings} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Photo du professeur (URL)</span>
              <input
                type="url"
                value={teacherPhoto}
                onChange={e => setTeacherPhoto(e.target.value)}
                className="input-dark mt-2 w-full rounded-2xl px-4 py-3 text-sm shadow-inner"
                placeholder="https://..."
                disabled={!authorized}
              />
            </label>
            <div className="sm:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Ou importer une image locale</span>
              <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="file"
                  accept="image/*"
                  disabled={!authorized}
                  onChange={e => onUploadTeacherPhoto(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  className="w-full rounded-2xl border border-dashed border-gray-600 bg-gray-900/70 px-4 py-3 text-slate-300 shadow-inner"
                />
                <button type="button" disabled={!authorized} className="btn-red" onClick={() => setTeacherPhoto('')}>Effacer</button>
              </div>
              <p className="mt-2 text-xs text-slate-400">L'image locale sera enregistrée dans votre navigateur (base64). Les URLs restent supportées.</p>
            </div>
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Résumé du cours</span>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                className="input-dark mt-2 w-full rounded-2xl px-4 py-3 text-sm shadow-inner"
                rows={4}
                disabled={!authorized}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Nouveau code d'accès (5 chiffres)</span>
              <input
                type="password"
                inputMode="numeric"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                className="input-dark mt-2 w-full rounded-2xl px-4 py-3 text-lg tracking-[0.4em] shadow-inner"
                placeholder="00000"
                disabled={!authorized}
              />
            </label>
            <div className="sm:self-end">
              <button type="submit" disabled={!authorized} className="btn-red">Enregistrer les paramètres</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
