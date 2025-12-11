import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
                <div className="rounded-[2rem] sm:rounded-[2.75rem] surface-dark p-6 sm:p-8 shadow-2xl">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">À propos</h1>
                        <Link to="/" className="btn-red px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base text-center">
                            Retour à l'accueil
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col items-center gap-6 sm:gap-8 text-center">
                        {/* Photo */}
                        <div className="h-32 w-32 sm:h-48 sm:w-48 overflow-hidden rounded-full border-4 sm:border-8 border-gray-700 shadow-2xl">
                            <img
                                src="/assets/richard-photo.jpg"
                                alt="Richard Szuszkiewicz"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="space-y-3 sm:space-y-4">
                            <p className="text-lg sm:text-xl font-semibold text-slate-200">
                                Auteur : <span className="text-white">Richard Szuszkiewicz</span>
                            </p>

                            <h2 className="text-xl sm:text-3xl font-extrabold tracking-[0.15em] sm:tracking-[0.2em] text-white">
                                COURS D'INITIATION<br />INFORMATIQUE N1
                            </h2>

                            <p className="text-base sm:text-lg text-slate-300">
                                Pour Seniors
                            </p>

                            <div className="pt-2 sm:pt-4">
                                <a
                                    href="/cours.pdf"
                                    download="Cours-Initiation-Informatique-N1.pdf"
                                    className="btn-outline-red inline-flex items-center gap-2 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    Télécharger le cours
                                </a>
                            </div>

                            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                                <p className="text-xs sm:text-sm text-slate-400">
                                    Quiz V1.0.0 • 2025
                                </p>
                                <p className="text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-2">
                                    © Tous les droits réservés
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
