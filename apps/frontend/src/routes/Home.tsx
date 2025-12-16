import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePicker from '../components/ProfilePicker';
import ImageSlider from '../components/ImageSlider';
import { useSettings } from '../lib/settings';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [settings, setSettings] = useSettings();

  useEffect(() => {
    const api = import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
    fetch(`${api}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.teacherPhotoUrl || data.courseSummary) {
          setSettings(prev => ({
            ...prev,
            teacherPhotoUrl: data.teacherPhotoUrl || prev.teacherPhotoUrl,
            courseSummary: data.courseSummary || prev.courseSummary
          }));
        }
      })
      .catch(err => console.error('Erreur chargement settings:', err));
  }, []);

  const goToFirstProfile = () => {
    navigate('/inscription');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-rows-[auto_200px_auto_auto] sm:grid-rows-[auto_350px_auto_auto] gap-4 sm:gap-8 px-4 py-4 sm:px-6 sm:py-8">
        {/* 1/4 - Menu hamburger en haut à droite */}
        <header className="relative row-start-1 row-end-2">
          <div className="absolute right-0 top-0">
            <button
              type="button"
              className="btn-red px-3 py-2 sm:px-4 sm:py-2"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Ouvrir le menu"
            >
              ☰
            </button>
            {menuOpen && (
              <nav className="mt-3 w-72 rounded-3xl bg-gray-900 border border-gray-700 p-6 text-sm shadow-2xl z-50 relative">
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
                  <li>
                    <Link to="/about" className="font-semibold text-slate-100 hover:text-white" onClick={() => setMenuOpen(false)}>
                      À propos
                    </Link>
                  </li>
                </ul>
              </nav>
            )}
          </div>
          <div className="text-center pt-2 sm:pt-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-400">Programme seniors</p>
            <h1 className="mt-2 text-xl sm:text-3xl font-extrabold tracking-[0.15em] sm:tracking-[0.25em] text-white md:text-4xl">
              COURS D'INITIATION<br />INFORMATIQUE N1
            </h1>
          </div>
        </header>

        {/* 2/4 - Slider Photos */}
        <section className="row-start-2 row-end-3">
          <ImageSlider images={[
            '/assets/slider/slide1.png',
            '/assets/slider/slide2.png',
            '/assets/slider/slide3.png',
            '/assets/slider/slide4.png',
            '/assets/slider/slide5.png'
          ]} />
        </section>

        {/* 3/4 - Profil professeur */}
        <section className="row-start-3 row-end-4 overflow-hidden rounded-[2rem] sm:rounded-[2.75rem] surface-dark shadow-2xl">
          <div className="flex h-full flex-col items-center justify-center gap-4 sm:gap-6 p-6 sm:p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="grid h-24 w-24 sm:h-40 sm:w-40 place-items-center overflow-hidden rounded-full border-[4px] sm:border-[6px] border-gray-700 bg-gray-800 text-white shadow-2xl">
                {settings.teacherPhotoUrl ? (
                  <img src={settings.teacherPhotoUrl} alt="Richard, votre professeur" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl sm:text-6xl font-extrabold">R</span>
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-400">Votre accompagnateur</p>
                <p className="text-2xl sm:text-4xl font-extrabold text-white">Richard</p>
                <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-300">
                  Pas à pas, je vous guide pour gagner en confiance avec l'ordinateur. Prenez votre temps, je suis là pour vous !
                </p>
              </div>
            </div>
            <div className="text-center mt-2 sm:mt-0">
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-400">Nouveau ?</p>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base font-semibold text-slate-200">Créez les profils de vos élèves en quelques clics.</p>
              <button type="button" onClick={goToFirstProfile} className="btn-red mt-3 sm:mt-4 text-sm sm:text-base px-6 py-3">
                Inscrire un élève
              </button>
            </div>
          </div>
        </section>

        {/* 4/4 - Slider profils élèves */}
        <section className="row-start-4 row-end-5 overflow-hidden">
          <div className="rounded-[2.75rem] surface-dark p-6 shadow-xl">
            <ProfilePicker />
          </div>
        </section>
      </div>
    </div>
  );
}

