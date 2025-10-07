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
      await saveQuestions(questions);
      setReport(errors.length ? errors : ['Import réussi ✅']);
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
      if (!/^\d{6}$/.test(newCode.trim())) {
        setReport(["Le code doit contenir 6 chiffres."]);
        return;
      }
      patch.adminCode = newCode.trim();
    }
    setSettings(patch);
    setReport(["Parametres sauvegardes."]);
    setNewCode('');
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
    <div className="min-h-screen bg-gradient-to-br from-pastel-lavender via-pastel-mint to-pastel-sky px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-4xl space-y-8 rounded-[2.75rem] bg-white/80 p-8 shadow-2xl backdrop-blur">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Espace sécurisé</p>
            <h1 className="text-3xl font-extrabold text-slate-900">Importation du questionnaire</h1>
            <p className="mt-2 text-slate-600">Protégez l'accès au contenu pédagogique grâce à votre code formateur.</p>
          </div>
          <Link to="/" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700">
            Retour
          </Link>
        </header>

        <section className="rounded-3xl bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800">Étape 1 — Vérification</h2>
          <form onSubmit={onSubmitCode} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Code de sécurité</span>
              <input
                type="password"
                inputMode="numeric"
                value={code}
                onChange={event => setCode(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg tracking-[0.4em] text-slate-800 shadow-inner focus:border-slate-500 focus:outline-none"
                placeholder="000000"
                aria-label="Code de sécurité"
              />
            </label>
            <button
              type="submit"
              className="mt-4 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700 sm:mt-auto"
            >
              Valider
            </button>
          </form>
        </section>
        
        <section className={`rounded-3xl p-6 shadow-lg ${authorized ? 'bg-white/90' : 'bg-white/50 opacity-70'}`} aria-disabled={!authorized}>
          <h2 className="text-xl font-semibold text-slate-800">Etape 3 - Parametres de la page d'accueil</h2>
          <form onSubmit={onSaveSettings} className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Photo du professeur (URL)</span>
              <input
                type="url"
                value={teacherPhoto}
                onChange={e => setTeacherPhoto(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-slate-500 focus:outline-none"
                placeholder="https://..."
                disabled={!authorized}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Resume du cours</span>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-slate-500 focus:outline-none"
                rows={4}
                disabled={!authorized}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Nouveau code d'acces (6 chiffres)</span>
              <input
                type="password"
                inputMode="numeric"
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg tracking-[0.4em] text-slate-800 shadow-inner focus:border-slate-500 focus:outline-none"
                placeholder="000000"
                disabled={!authorized}
              />
            </label>
            <button
              type="submit"
              disabled={!authorized}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700 disabled:opacity-50"
            >
              Enregistrer les parametres
            </button>
          </form>
        </section>

        <section className={`rounded-3xl p-6 shadow-lg ${authorized ? 'bg-white/90' : 'bg-white/50 opacity-70'}`} aria-disabled={!authorized}>
          <h2 className="text-xl font-semibold text-slate-800">Étape 2 — Importer votre fichier CSV</h2>
          <p className="mt-2 text-slate-600">
            Sélectionnez le fichier exporté depuis votre tableur (format UTF-8). Les anciennes questions seront remplacées.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={event => {
                if (!authorized || !event.target.files) return;
                const file = event.target.files[0];
                if (file) handleFile(file);
              }}
              className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-slate-600 shadow-inner transition hover:border-slate-500"
              disabled={!authorized || isLoading}
            />
            {isLoading && <p className="text-sm text-slate-500">Importation en cours...</p>}
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {report.map((item, index) => (
              <li key={`${item}-${index}`} className="rounded-2xl bg-white/80 px-4 py-2 shadow">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
