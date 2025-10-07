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
      <div className="rounded-3xl bg-gray-800/70 p-6 text-center shadow-lg">
        <p className="text-lg font-semibold text-slate-100">Aucun profil enregistré pour le moment.</p>
        <p className="mt-2 text-slate-300">Rendez-vous sur la page d'inscription pour ajouter vos élèves.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200">Choisissez votre profil</h2>
        <div className="hidden gap-2 md:flex">
          <button type="button" onClick={() => scrollBy(-240)} className="btn-red px-3 py-2 text-xs" aria-label="Afficher les profils précédents">«</button>
          <button type="button" onClick={() => scrollBy(240)} className="btn-red px-3 py-2 text-xs" aria-label="Afficher les profils suivants">»</button>
        </div>
      </div>
      <div ref={scrollerRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pr-4" role="list" aria-label="Profils disponibles">
        {profiles.map(profile => (
          <Link
            key={profile.id}
            to={`/quiz?profile=${encodeURIComponent(profile.name)}`}
            className="group relative min-w-[220px] snap-start rounded-3xl bg-gray-800/60 p-6 text-center shadow-lg transition hover:-translate-y-1 hover:bg-gray-800/80"
            role="listitem"
          >
            <div className="absolute inset-2 rounded-[26px] opacity-70 blur-xl" style={{ background: profile.color }} aria-hidden="true" />
            <div className="relative">
              {profile.photo ? (
                <img src={profile.photo} alt={`Photo de ${profile.name}`} className="mx-auto h-32 w-32 rounded-full border-4 border-gray-700 object-cover shadow-inner" />
              ) : (
                <div className="mx-auto grid h-32 w-32 place-items-center rounded-full border-4 border-gray-700 bg-gray-900 text-white shadow-inner">
                  <span className="text-3xl font-bold">{profile.name?.[0]?.toUpperCase() || '?'}</span>
                </div>
              )}
              <p className="mt-4 text-lg font-semibold text-slate-100 group-hover:text-white">{profile.name}</p>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Prêt(e) ?</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

