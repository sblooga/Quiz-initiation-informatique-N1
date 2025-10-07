import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePicker from '../components/ProfilePicker';
import { getSettings } from '../lib/settings';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const settings = getSettings();

  const goToFirstProfile = () => {
    navigate('/inscription');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-rows-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] gap-8 px-6 py-8">
        {/* 1/3 - Menu hamburger en haut à droite */}
        <header className="relative row-start-1 row-end-2">
          <div className="absolute right-0 top-0">
            <button
              type="button"
              className="btn-red px-4 py-2"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Ouvrir le menu"
            >
              ☰
            </button>
            {menuOpen && (
              <nav className="mt-3 w-72 rounded-3xl surface-dark p-6 text-sm shadow-2xl">
                <ul className="space-y-4">
                  <li>
                    <Link to="/admin" className="font-semibold text-slate-100 hover:text-white" onClick={() => setMenuOpen(false)}>
                      Maintenance (code 00000)
                    </Link>
                  </li>
                  <li>
                    <Link to="/inscription" className="font-semibold text-slate-100 hover:text-white" onClick={() => setMenuOpen(false)}>
                      Inscription des élèves
                    </Link>
                  </li>
                  <li>
                    <Link to="/scores" className="font-semibold text-slate-100 hover:text-white" onClick={() => setMenuOpen(false)}>
                      Scores & graphiques
                    </Link>
                  </li>
                </ul>
              </nav>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-400">Programme seniors</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[0.25em] text-white sm:text-4xl">
              COURS D'INITIATION INFORMATIQUE N1
            </h1>
          </div>
        </header>

        {/* 2/3 - Profil professeur */}
        <section className="row-start-2 row-end-3 overflow-hidden rounded-[2.75rem] surface-dark shadow-2xl">
          <div className="flex h-full flex-col items-center justify-center gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <div className="grid h-40 w-40 place-items-center overflow-hidden rounded-full border-[6px] border-gray-700 bg-gray-800 text-white shadow-2xl">
                {settings.teacherPhotoUrl ? (
                  <img src={settings.teacherPhotoUrl} alt="Richard, votre professeur" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-6xl font-extrabold">R</span>
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Votre accompagnateur</p>
                <p className="text-4xl font-extrabold text-white">Richard</p>
                <p className="mt-2 max-w-xl text-base text-slate-300">
                  Pas à pas, je vous guide pour gagner en confiance avec l'ordinateur. Prenez votre temps, je suis là pour vous !
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Nouveau ?</p>
              <p className="mt-2 font-semibold text-slate-200">Créez les profils de vos élèves en quelques clics.</p>
              <button type="button" onClick={goToFirstProfile} className="btn-red mt-4">
                Inscrire un élève
              </button>
            </div>
          </div>
        </section>

        {/* 3/3 - Slider profils élèves */}
        <section className="row-start-3 row-end-4">
          <div className="rounded-[2.75rem] surface-dark p-6 shadow-xl">
            <ProfilePicker />
          </div>
        </section>
      </div>
    </div>
  );
}

