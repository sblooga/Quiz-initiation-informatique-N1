import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PROFILE_PHOTO_LIBRARY, Profile, useProfiles } from '../lib/profiles';

interface DraftProfile {
  name: string;
  photo: string;
  color: string;
}

const palette = ['#d9cffc', '#ffe4c4', '#d1f2ff', '#ffe3f3', '#fdf3c7', '#c9f5e9'];

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

function createDraftFromProfile(profile: Profile): DraftProfile {
  return { name: profile.name, photo: profile.photo, color: profile.color };
}

export default function Enrollment() {
  const { profiles, setProfiles } = useProfiles();
  const [draft, setDraft] = useState<DraftProfile>(() => ({ name: '', photo: PROFILE_PHOTO_LIBRARY[0], color: palette[0] }));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const sortedProfiles = useMemo(() => profiles.slice().sort((a, b) => a.name.localeCompare(b.name)), [profiles]);

  const resetDraft = () => {
    setDraft({ name: '', photo: PROFILE_PHOTO_LIBRARY[0], color: palette[Math.floor(Math.random() * palette.length)] });
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

  const onSelectPhoto = (url: string) => {
    setDraft(prev => ({ ...prev, photo: url }));
  };

  const onSelectColor = (color: string) => {
    setDraft(prev => ({ ...prev, color }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-rose via-pastel-butter to-pastel-sky px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-5xl space-y-10 rounded-[2.75rem] bg-white/80 p-8 shadow-2xl backdrop-blur">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Espace formateur</p>
            <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Gestion des profils élèves</h1>
          </div>
          <Link to="/" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700">
            Retour à l'accueil
          </Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-[2fr,3fr]">
          <form onSubmit={editingId ? saveEdit : handleSubmit} className="rounded-3xl bg-white/90 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800">{editingId ? 'Modifier un profil' : 'Inscrire un nouvel élève'}</h2>
            <div className="mt-6 space-y-6">
              <label className="block text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Prénom
                <input
                  value={draft.name}
                  onChange={event => setDraft(prev => ({ ...prev, name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg text-slate-800 shadow-inner focus:border-slate-500 focus:outline-none"
                  placeholder="Ex : Marie"
                  aria-label="Prénom de l'élève"
                />
              </label>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Photo du profil</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {PROFILE_PHOTO_LIBRARY.map(url => (
                    <button
                      type="button"
                      key={url}
                      onClick={() => onSelectPhoto(url)}
                      className={`overflow-hidden rounded-2xl border-4 ${draft.photo === url ? 'border-slate-900' : 'border-transparent'} bg-slate-100 shadow`}
                      aria-label="Sélectionner cette photo"
                    >
                      <img src={url} alt="Option de photo" className="h-24 w-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Ou collez l'URL d'une photo personnalisée"
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
                  value={draft.photo.startsWith('http') ? draft.photo : ''}
                  onChange={event => onSelectPhoto(event.target.value)}
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Couleur de fond</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {palette.map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => onSelectColor(color)}
                      className={`h-10 w-10 rounded-full border-4 ${draft.color === color ? 'border-slate-900' : 'border-white'} shadow`}
                      style={{ background: color }}
                      aria-label={`Choisir la couleur ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700"
              >
                {editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-slate-800 shadow-lg transition hover:bg-slate-100"
                >
                  Annuler
                </button>
              )}
            </div>
            {feedback && <p className="mt-4 text-sm text-slate-600">{feedback}</p>}
          </form>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Profils enregistrés</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {sortedProfiles.map(profile => (
                <article key={profile.id} className="relative overflow-hidden rounded-3xl bg-white/80 shadow-lg">
                  <div className="absolute inset-0 opacity-40" style={{ background: profile.color }} aria-hidden="true" />
                  <div className="relative p-6">
                    <img src={profile.photo} alt={profile.name} className="h-32 w-full rounded-2xl object-cover shadow-lg" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{profile.name}</h3>
                    <p className="text-sm text-slate-600">Couleur associée : {profile.color}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(profile)}
                        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow hover:bg-slate-700"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProfile(profile)}
                        className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-800 shadow hover:bg-slate-100"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!sortedProfiles.length && (
                <p className="rounded-3xl bg-white/80 p-6 text-center text-slate-600 shadow-inner">
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
