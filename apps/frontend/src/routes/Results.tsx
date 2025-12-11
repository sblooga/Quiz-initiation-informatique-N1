import { useLocation, Link } from 'react-router-dom';
import ScoreCard from '../components/ScoreCard';
import PDFLink from '../components/PDFLink';

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
  const { answers, profile } = (state as LocationState) || { answers: [], profile: 'Anonyme' };
  const score = answers.filter(a => a.correct).length;
  const mistakes = answers.filter(a => !a.correct);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8 rounded-[2.75rem] surface-dark p-8 shadow-2xl">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Bravo {profile} !</p>
            <h1 className="text-3xl font-extrabold text-white md:text-4xl">Résultats de votre séance</h1>
            <p className="mt-2 text-slate-300">Découvrez votre score et les questions à revoir pour progresser sereinement.</p>
          </div>
          <Link to="/" className="btn-red">Accueil</Link>
        </header>

        {/* Mini graphique circulaire */}
        <section className="grid gap-6 rounded-[2.75rem] bg-gray-800/70 p-8 shadow-inner sm:grid-cols-[240px_1fr]">
          <div className="relative mx-auto grid h-48 w-48 place-items-center">
            <svg viewBox="0 0 36 36" className="h-48 w-48 -rotate-90">
              <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="#1f2937" strokeWidth="4" />
              <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="#dc2626" strokeDasharray={`${(score / 10) * 100}, 100`} strokeLinecap="round" strokeWidth="4" />
            </svg>
            <div className="absolute grid place-items-center">
              <p className="text-3xl font-extrabold text-white">{score}/10</p>
              <p className="text-xs uppercase tracking-widest text-slate-400">{profile}</p>
            </div>
          </div>
          <div className="self-center">
            <ScoreCard score={score} />
          </div>
        </section>

        <div className="rounded-3xl bg-gray-800/70 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-100">Que souhaitez-vous faire ?</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link to={`/quiz?profile=${encodeURIComponent(profile)}`} className="btn-red">Refaire le quiz</Link>
            <Link to={`/scores?profile=${encodeURIComponent(profile)}`} className="btn-red">Voir les progrès</Link>
          </div>
        </div>

        {mistakes.length > 0 ? (
          <section className="rounded-3xl bg-gray-800/70 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-100">Réponses à revoir</h2>
            <p className="mt-2 text-slate-300">Reprenez tranquillement ces notions grâce aux liens vers vos supports de cours.</p>
            <ul className="mt-4 space-y-4">
              {mistakes.map((mistake, index) => (
                <li key={index} className="rounded-3xl bg-gray-900/60 p-5 shadow-inner">
                  <p className="text-lg font-semibold text-white">{mistake.question.question}</p>
                  <p className="mt-2 text-sm text-slate-300">Votre réponse : <span className="font-semibold text-slate-100">{JSON.stringify(mistake.user)}</span></p>
                  <p className="text-sm text-slate-300">Bonne réponse : <span className="font-semibold text-slate-100">{JSON.stringify(mistake.question.answer)}</span></p>
                  {(mistake.question.lesson || mistake.question.pagePDF || mistake.question.pdfSearchText) && (
                    <div className="mt-3">
                      <PDFLink lesson={mistake.question.lesson} page={mistake.question.pagePDF} motCle={mistake.question.motClePDF} searchText={mistake.question.pdfSearchText} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="rounded-3xl bg-gray-800/70 p-6 text-center text-slate-200 shadow-lg">
            <p>Toutes les réponses sont correctes. Excellent travail !</p>
          </section>
        )}

        {/* Bouton retour à l'accueil */}
        <div className="flex justify-center">
          <Link to="/" className="btn-red px-8 py-3">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}

