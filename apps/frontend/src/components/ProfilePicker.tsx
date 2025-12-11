import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfiles } from '../lib/profiles';

export default function ProfilePicker() {
  const { profiles } = useProfiles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Responsive: ajuster le nombre d'éléments visibles selon la largeur
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);      // Mobile
      else if (window.innerWidth < 1024) setItemsPerPage(2); // Tablette
      else setItemsPerPage(3);                               // Desktop
    };

    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(profiles.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (!profiles.length) {
    return (
      <div className="rounded-3xl bg-gray-800/70 p-6 text-center shadow-lg">
        <p className="text-lg font-semibold text-slate-100">Aucun profil enregistré pour le moment.</p>
        <p className="mt-2 text-slate-300">Rendez-vous sur la page d'inscription pour ajouter vos élèves.</p>
      </div>
    );
  }

  // Calcul des éléments à afficher pour la "page" courante (virtuelle)
  // En fait, pour un slider fluide, on affiche tout mais on translate.
  // Ici, on va faire un slider simple par "pages" ou par "item".
  // Pour simplifier et garantir la réactivité, on va translater le conteneur.

  return (
    <div className="relative group">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-200">Choisissez votre profil</h2>

        {/* Contrôles (toujours visibles) */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prevSlide}
            className="btn-red px-3 py-2 text-lg disabled:opacity-50"
            disabled={profiles.length <= itemsPerPage}
            aria-label="Précédent"
          >
            ←
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="btn-red px-3 py-2 text-lg disabled:opacity-50"
            disabled={profiles.length <= itemsPerPage}
            aria-label="Suivant"
          >
            →
          </button>
        </div>
      </div>

      {/* Fenêtre du slider */}
      <div className="overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${totalPages * 100}%`
          }}
        >
          {/* On groupe les profils par "pages" pour simplifier le layout flex */}
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const pageProfiles = profiles.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage);
            return (
              <div key={pageIndex} className="flex w-full justify-center gap-4 px-1" style={{ width: '100%' }}>
                {pageProfiles.map(profile => (
                  <Link
                    key={profile.id}
                    to={`/quiz?profile=${encodeURIComponent(profile.name)}`}
                    className="group/card relative flex-1 min-w-0 rounded-3xl bg-gray-800/60 p-6 text-center shadow-lg transition hover:-translate-y-1 hover:bg-gray-800/80"
                    style={{ maxWidth: `${100 / itemsPerPage}%` }} // Largeur fixe relative
                  >
                    <div className="absolute inset-2 rounded-[26px] opacity-70 blur-xl" style={{ background: profile.color }} aria-hidden="true" />
                    <div className="relative flex flex-col items-center h-full justify-between">
                      <div>
                        {profile.photo ? (
                          <img src={profile.photo} alt={`Photo de ${profile.name}`} className="mx-auto h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-gray-700 object-cover shadow-inner" />
                        ) : (
                          <div className="mx-auto grid h-24 w-24 sm:h-32 sm:w-32 place-items-center rounded-full border-4 border-gray-700 bg-gray-900 text-white shadow-inner">
                            <span className="text-2xl sm:text-3xl font-bold">{profile.name?.[0]?.toUpperCase() || '?'}</span>
                          </div>
                        )}
                        <p className="mt-4 text-lg font-semibold text-slate-100 group-hover/card:text-white truncate w-full">{profile.name}</p>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm uppercase tracking-[0.3em] text-slate-400">Prêt(e) ?</p>
                    </div>
                  </Link>
                ))}
                {/* Remplissage vide si la dernière page n'est pas complète */}
                {Array.from({ length: itemsPerPage - pageProfiles.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex-1 min-w-0 opacity-0" />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicateurs (dots) */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 w-2 rounded-full transition-all ${currentIndex === idx ? 'bg-white w-4' : 'bg-gray-600 hover:bg-gray-400'
                }`}
              aria-label={`Aller à la page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

