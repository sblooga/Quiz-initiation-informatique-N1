import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '../lib/profiles';

export default function ProfilePicker() {
  const { profiles } = useProfiles();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (offset: number) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!profiles.length) {
    return (
      <div className="rounded-3xl bg-white/80 p-6 text-center shadow-lg">
        <p className="text-lg font-semibold text-slate-700">
          Aucun profil enregistré pour le moment.
        </p>
        <p className="mt-2 text-slate-600">Rendez-vous sur la page d'inscription pour ajouter vos élèves.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-700">Choisissez votre profil</h2>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollBy(-240)}
            className="rounded-full bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-white"
            aria-label="Afficher les profils précédents"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => scrollBy(240)}
            className="rounded-full bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-white"
            aria-label="Afficher les profils suivants"
          >
            ▶
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pr-4"
        role="list"
        aria-label="Profils disponibles"
      >
        {profiles.map(profile => (
          <Link
            key={profile.id}
            to={`/quiz?profile=${encodeURIComponent(profile.name)}`}
            className="group relative min-w-[220px] snap-start rounded-3xl bg-white/70 p-6 text-center shadow-lg transition hover:-translate-y-1 hover:bg-white"
            role="listitem"
          >
            <div
              className="absolute inset-2 rounded-[26px] opacity-70 blur-xl"
              style={{ background: profile.color }}
              aria-hidden="true"
            />
            <div className="relative">
              <img
                src={profile.photo}
                alt={`Photo de ${profile.name}`}
                className="mx-auto h-32 w-32 rounded-full border-4 border-white object-cover shadow-inner"
              />
              <p className="mt-4 text-lg font-semibold text-slate-800 group-hover:text-slate-900">{profile.name}</p>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Prêt(e) ?</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
