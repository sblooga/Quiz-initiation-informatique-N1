import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HighContrastToggle from '../components/HighContrastToggle';
import ProfilePicker from '../components/ProfilePicker';
import { getSettings } from '../lib/settings';

const teacherPhotoDefault = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80';
const heroBackdrop = 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
const secondaryVisuals = [
  {
    title: 'Quiz interactif',
    description: 'Questions variées et adaptées pour progresser en douceur.',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Ateliers ludiques',
    description: 'Des activités pas-à-pas pour découvrir l\'informatique en s\'amusant.',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Suivi personnalisé',
    description: 'Visualisez les progrès de chaque élève en un clin d\'œil.',
    image: 'https://images.unsplash.com/photo-1500043208383-7f1a9a3c7483?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const settings = getSettings();

  const goToFirstProfile = () => {
    navigate('/inscription');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-lavender via-pastel-rose to-pastel-sky text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-10">
        <header className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.5em] text-slate-600">Programme seniors</p>
            <h1 className="text-3xl font-extrabold tracking-[0.3em] text-slate-900 sm:text-4xl">
              COURS D'INITIATION INFORMATIQUE N1
            </h1>
          </div>
          <div className="flex items-center gap-3 self-end">
            <HighContrastToggle />
            <button
              type="button"
              className="rounded-full bg-white/80 px-4 py-3 font-semibold uppercase tracking-[0.4em] text-slate-700 shadow-lg transition hover:bg-white"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Ouvrir le menu de navigation"
            >
              ☰
            </button>
            {menuOpen && (
              <nav className="absolute right-0 top-16 w-64 rounded-3xl bg-white/90 p-6 text-sm shadow-2xl backdrop-blur">
                <ul className="space-y-4">
                  <li>
                    <Link to="/admin" className="block font-semibold text-slate-700 hover:text-slate-900" onClick={() => setMenuOpen(false)}>
                      Importation CSV (code 00000)
                    </Link>
                  </li>
                  <li>
                    <Link to="/inscription" className="block font-semibold text-slate-700 hover:text-slate-900" onClick={() => setMenuOpen(false)}>
                      Inscription des élèves
                    </Link>
                  </li>
                  <li>
                    <Link to="/scores" className="block font-semibold text-slate-700 hover:text-slate-900" onClick={() => setMenuOpen(false)}>
                      Scores &amp; graphiques
                    </Link>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </header>

        <main className="mt-10 flex flex-1 flex-col gap-12">
          <section className="relative min-h-[30vh] overflow-hidden rounded-[2.75rem] bg-white/40 shadow-xl">
            <img
              src={heroBackdrop}
              alt="Horloge rappelant le temps d'un quiz"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="relative flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-6">
                <div className="overflow-hidden rounded-full border-[6px] border-white shadow-2xl">
                  <img src={settings.teacherPhotoUrl || teacherPhotoDefault} alt="Richard, votre professeur" className="h-40 w-40 object-cover" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.5em] text-slate-600">Votre accompagnateur</p>
                  <p className="text-4xl font-extrabold text-slate-900">Richard</p>
                  <p className="mt-2 max-w-md text-lg text-slate-700">
                    "Pas à pas, je vous guide pour gagner en confiance avec l'ordinateur. Prenez votre temps, je suis là pour vous !"
                  </p>
                </div>
              </div>
              <div className="rounded-[2rem] bg-white/80 p-6 text-center shadow-lg">
                <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Nouveau ?</p>
                <p className="mt-2 font-semibold text-slate-700">Créez les profils de vos élèves en quelques clics.</p>
                <button
                  type="button"
                  onClick={goToFirstProfile}
                  className="mt-4 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700"
                >
                  Inscrire un élève
                </button>
              </div>
            </div>
          </section>

          <section className="flex flex-1 flex-col gap-10 lg:flex-row">
            <div className="lg:w-1/3">
              <ProfilePicker />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-8">
              <div className="rounded-[2.75rem] bg-white/80 p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-800">Bienvenue dans votre espace numérique</h2>
                <p className="mt-3 text-lg text-slate-600">
                  Rejoignez la séance du jour et laissez-vous guider question après question. Les consignes sont claires, les boutons sont larges
                  et la mise en page a été pensée pour un confort de lecture optimal.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    to="/quiz"
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700"
                  >
                    Lancer le quiz
                  </Link>
                  <Link
                    to="/scores"
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-slate-800 shadow-lg transition hover:bg-slate-100"
                  >
                    Voir les progrès
                  </Link>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {secondaryVisuals.map(item => (
                  <div key={item.title} className="group overflow-hidden rounded-3xl bg-white/70 shadow-lg transition hover:-translate-y-2 hover:bg-white">
                    <div className="relative h-40 overflow-hidden">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
