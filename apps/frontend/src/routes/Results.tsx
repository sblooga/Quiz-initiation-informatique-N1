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
    <div className="min-h-screen bg-gradient-to-br from-pastel-mint via-pastel-lavender to-pastel-rose px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-5xl space-y-8 rounded-[2.75rem] bg-white/80 p-8 shadow-2xl backdrop-blur">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Bravo {profile} !</p>
            <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Résultats de votre séance</h1>
            <p className="mt-2 text-slate-600">Découvrez votre score et les questions à revoir pour progresser sereinement.</p>
          </div>
          <Link to="/" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700">
            Accueil
          </Link>
        </header>

        <ScoreCard score={score} />

        <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800">Que souhaitez-vous faire ?</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              to={`/quiz?profile=${encodeURIComponent(profile)}`}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700"
            >
              Refaire le quiz
            </Link>
            <Link
              to={`/scores?profile=${encodeURIComponent(profile)}`}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-slate-800 shadow-lg transition hover:bg-slate-100"
            >
              Voir les progrès
            </Link>
          </div>
        </div>

        {mistakes.length > 0 ? (
          <section className="rounded-3xl bg-white/90 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800">Réponses à revoir</h2>
            <p className="mt-2 text-slate-600">Reprenez tranquillement ces notions grâce aux liens vers vos supports de cours.</p>
            <ul className="mt-4 space-y-4">
              {mistakes.map((mistake, index) => (
                <li key={index} className="rounded-3xl bg-white/80 p-5 shadow-inner">
                  <p className="text-lg font-semibold text-slate-900">{mistake.question.question}</p>
                  <p className="mt-2 text-sm text-slate-600">Votre réponse : <span className="font-semibold text-slate-800">{JSON.stringify(mistake.user)}</span></p>
                  <p className="text-sm text-slate-600">Bonne réponse : <span className="font-semibold text-slate-800">{JSON.stringify(mistake.question.answer)}</span></p>
                  {mistake.question.pagePDF && (
                    <div className="mt-3">
                      <PDFLink page={mistake.question.pagePDF} motCle={mistake.question.motClePDF} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="rounded-3xl bg-white/90 p-6 text-center text-slate-700 shadow-lg">
            <p>Toutes les réponses sont correctes. Excellent travail !</p>
          </section>
        )}
      </div>
    </div>
  );
}
