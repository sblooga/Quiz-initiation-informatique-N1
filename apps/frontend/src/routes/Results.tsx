import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ScoreCard from '../components/ScoreCard';
import PDFLink from '../components/PDFLink';
import { getSessionById } from '../services/quizApiService';
import { useProfiles } from '../lib/profiles';

interface AnswerRecord {
  question: any;
  user: any;
  correct: boolean;
}

interface LocationState {
  answers: AnswerRecord[];
  profile: string;
}

export default function Results() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const { profiles } = useProfiles();
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [profile, setProfile] = useState<string>('Anonyme');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId) {
      // Load session from API
      setLoading(true);
      getSessionById(Number(sessionId))
        .then(session => {
          if (session.answers) {
            setAnswers(session.answers);
          }
          // Find profile name from profileId
          const profileData = profiles.find(p => p.id === String(session.profileId));
          if (profileData) {
            setProfile(profileData.name);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading session:', err);
          setLoading(false);
        });
    } else if (state) {
      // Load from navigation state (just completed quiz)
      const { answers: stateAnswers, profile: stateProfile } = state as LocationState;
      setAnswers(stateAnswers || []);
      setProfile(stateProfile || 'Anonyme');
    }
  }, [searchParams, state, profiles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-5xl space-y-8 rounded-[2.75rem] surface-dark p-8 shadow-2xl">
          <p className="text-center text-xl">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  const score = answers.filter(a => a.correct).length;
  const mistakes = answers.filter(a => !a.correct);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-6 sm:px-6 sm:py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8 rounded-[2rem] sm:rounded-[2.75rem] surface-dark p-4 sm:p-8 shadow-2xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-400">Bravo {profile} !</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white md:text-4xl">Résultats de votre séance</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300">Découvrez votre score et les questions à revoir pour progresser sereinement.</p>
          </div>
          <Link to="/" className="btn-red text-center sm:text-left">Accueil</Link>
        </header>

        {/* Mini graphique circulaire */}
        <section className="grid gap-6 rounded-[2rem] sm:rounded-[2.75rem] bg-gray-800/70 p-6 sm:p-8 shadow-inner grid-cols-1 sm:grid-cols-[240px_1fr]">
          <div className="relative mx-auto grid h-40 w-40 sm:h-48 sm:w-48 place-items-center">
            <svg viewBox="0 0 36 36" className="h-40 w-40 sm:h-48 sm:w-48 -rotate-90">
              <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="#1f2937" strokeWidth="4" />
              <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="#dc2626" strokeDasharray={`${(score / 10) * 100}, 100`} strokeLinecap="round" strokeWidth="4" />
            </svg>
            <div className="absolute grid place-items-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{score}/10</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400">{profile}</p>
            </div>
          </div>
          <div className="self-center">
            <ScoreCard score={score} />
          </div>
        </section>

        <div className="rounded-3xl bg-gray-800/70 p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Que souhaitez-vous faire ?</h2>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to={`/quiz?profile=${encodeURIComponent(profile)}`} className="btn-red text-center">Refaire le quiz</Link>
            <Link to={`/scores?profile=${encodeURIComponent(profile)}`} className="btn-red text-center">Voir les progrès</Link>
          </div>
        </div>

        {mistakes.length > 0 ? (
          <section className="rounded-3xl bg-gray-800/70 p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Réponses à revoir</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300">Reprenez tranquillement ces notions grâce aux liens vers vos supports de cours.</p>
            <ul className="mt-4 space-y-4">
              {mistakes.map((mistake, index) => (
                <li key={index} className="rounded-2xl sm:rounded-3xl bg-gray-900/60 p-4 sm:p-5 shadow-inner">
                  <p className="text-base sm:text-lg font-semibold text-white">{mistake.question.question}</p>
                  <div className="mt-3 space-y-2 text-sm sm:text-base">
                    <p className="text-slate-300">
                      Votre réponse : <span className="font-semibold text-red-400 block sm:inline">{Array.isArray(mistake.user) ? mistake.user.join(', ') : String(mistake.user)}</span>
                    </p>
                    <p className="text-slate-300">
                      Bonne réponse : <span className="font-semibold text-green-400 block sm:inline">{Array.isArray(mistake.question.answer) ? mistake.question.answer.join(', ') : String(mistake.question.answer)}</span>
                    </p>
                  </div>
                  {(mistake.question.lesson || mistake.question.pagePDF || mistake.question.pdfSearchText) && (
                    <div className="mt-4">
                      <PDFLink lesson={mistake.question.lesson} page={mistake.question.pagePDF} motCle={mistake.question.motClePDF} searchText={mistake.question.pdfSearchText} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="rounded-3xl bg-gray-800/70 p-6 text-center text-slate-200 shadow-lg">
            <p className="text-base sm:text-lg">Toutes les réponses sont correctes. Excellent travail !</p>
          </section>
        )}

        {/* Bouton retour à l'accueil */}
        <div className="flex justify-center">
          <Link to="/" className="btn-red px-6 py-3 sm:px-8 sm:py-3 text-sm sm:text-base">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}

