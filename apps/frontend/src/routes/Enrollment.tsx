import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Profile, useProfiles } from '../lib/profiles';

interface DraftProfile {
  name: string;
  photo: string;
  color: string;
}

const palette = ['#374151', '#4b5563', '#6b7280', '#1f2937', '#111827', '#0f172a'];

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

function createDraftFromProfile(profile: Profile): DraftProfile {
  return { name: profile.name, photo: profile.photo, color: profile.color };
}

export default function Enrollment() {
  const { profiles, setProfiles } = useProfiles();
  const [draft, setDraft] = useState<DraftProfile>(() => ({ name: '', photo: '', color: palette[0] }));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const sortedProfiles = useMemo(() => profiles.slice().sort((a, b) => a.name.localeCompare(b.name)), [profiles]);

  const resetDraft = () => {
    setDraft({ name: '', photo: '', color: palette[Math.floor(Math.random() * palette.length)] });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setFeedback('Veuillez entrer un prénom.');
      return;
    }

    setProfiles(prev => [
      ...prev,
      {
        id: createId(),
        name: draft.name.trim(),
        photo: draft.photo,
        color: draft.color
      }
    ]);
    setFeedback(`Profil de ${draft.name.trim()} ajouté !`);
    resetDraft();
  };

  const startEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setDraft(createDraftFromProfile(profile));
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetDraft();
  };

  const saveEdit = (event: FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    if (!draft.name.trim()) {
      setFeedback('Veuillez entrer un prénom.');
      return;
    }

    setProfiles(prev => prev.map(p => (p.id === editingId ? { ...p, name: draft.name.trim(), photo: draft.photo, color: draft.color } : p)));
    setFeedback(`Profil de ${draft.name.trim()} mis à jour !`);
    setEditingId(null);
    resetDraft();
  };

  const removeProfile = (profile: Profile) => {
    if (!confirm(`Supprimer ${profile.name} ?`)) return;
    setProfiles(prev => prev.filter(p => p.id !== profile.id));
    setFeedback(`${profile.name} a été retiré(e) de la liste.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-10 rounded-[2.75rem] surface-dark p-8 shadow-2xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Espace formateur</p>
            <h1 className="text-3xl font-extrabold text-white md:text-4xl">Gestion des profils élèves</h1>
          </div>
          <Link to="/" className="btn-red">Retour à l'accueil</Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-[2fr,3fr]">
          <form onSubmit={editingId ? saveEdit : handleSubmit} className="rounded-3xl bg-gray-800/70 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-100">{editingId ? 'Modifier un profil' : 'Inscrire un nouvel élève'}</h2>
            <div className="mt-6 space-y-6">
              <label className="block text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Prénom
                <input
                  value={draft.name}
                  onChange={event => setDraft(prev => ({ ...prev, name: event.target.value }))}
                  className="input-dark mt-2 w-full rounded-2xl px-4 py-3 text-lg shadow-inner"
                  placeholder="Ex : Marie"
                  aria-label="Prénom de l'élève"
                />
              </label>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Photo du profil (URL optionnelle)</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-gray-700 bg-gray-900 text-white shadow-inner">
                    {draft.photo ? (
                      <img src={draft.photo} alt="Aperçu" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold">{draft.name?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="Collez l'URL d'une photo (facultatif)"
                    className="input-dark w-full rounded-2xl px-4 py-3 text-sm"
                    value={draft.photo}
                    onChange={event => setDraft(prev => ({ ...prev, photo: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Couleur de fond</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {palette.map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setDraft(prev => ({ ...prev, color }))}
                      className={`h-10 w-10 rounded-full border-4 ${draft.color === color ? 'border-red-600' : 'border-gray-700'} shadow`}
                      style={{ background: color }}
                      aria-label={`Choisir la couleur ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="submit" className="btn-red">{editingId ? 'Enregistrer' : 'Ajouter'}</button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-red">Annuler</button>
              )}
            </div>
            {feedback && <p className="mt-4 text-sm text-slate-300">{feedback}</p>}
          </form>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100">Profils enregistrés</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {sortedProfiles.map(profile => (
                <article key={profile.id} className="relative overflow-hidden rounded-3xl bg-gray-800/70 shadow-lg">
                  <div className="absolute inset-0 opacity-30" style={{ background: profile.color }} aria-hidden="true" />
                  <div className="relative p-6">
                    <div className="grid h-28 w-full place-items-center overflow-hidden rounded-2xl bg-gray-900">
                      {profile.photo ? (
                        <img src={profile.photo} alt={profile.name} className="h-28 w-full rounded-2xl object-cover" />
                      ) : (
                        <div className="grid h-28 w-full place-items-center text-2xl font-bold text-white">
                          {profile.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{profile.name}</h3>
                    <p className="text-sm text-slate-300">Couleur associée : {profile.color}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEdit(profile)} className="btn-red px-4 py-2 text-xs">Modifier</button>
                      <button type="button" onClick={() => removeProfile(profile)} className="btn-red px-4 py-2 text-xs">Supprimer</button>
                    </div>
                  </div>
                </article>
              ))}
              {!sortedProfiles.length && (
                <p className="rounded-3xl bg-gray-800/70 p-6 text-center text-slate-300 shadow-inner">
                  Aucun élève inscrit pour le moment. Ajoutez votre première fiche à gauche.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

