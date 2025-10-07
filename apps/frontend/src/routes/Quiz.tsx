import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { loadQuestions, saveSession } from '../lib/db.indexeddb';
import { Question } from '../lib/types';
import { shuffle, seedFromProfile } from '../lib/random';
import QuestionRenderer from '../components/QuestionRenderer';
import PDFLink from '../components/PDFLink';

type QuizStatus = 'loading' | 'ready' | 'empty' | 'error';

interface AnswerRecord {
  question: Question;
  user: any;
  correct: boolean;
}

export default function Quiz() {
  const [params] = useSearchParams();
  const profile = params.get('profile') || 'Anonyme';
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [status, setStatus] = useState<QuizStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastUserAnswer, setLastUserAnswer] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setErrorMessage('');
    setIndex(0);
    setAnswers([]);

    (async () => {
      try {
        const all = await loadQuestions();
        if (cancelled) return;

        if (!all.length) {
          setQuestions([]);
          setStatus('empty');
          return;
        }

        const seed = seedFromProfile(profile, Date.now());
        const shuffled = shuffle(all, seed).slice(0, 10);
        setQuestions(shuffled);
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        setErrorMessage(message);
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const handleAnswer = (correct: boolean, userAnswer: any) => {
    const current = questions[index];
    if (!current) return;

    const newAnswers = [...answers, { question: current, user: userAnswer, correct }];
    setAnswers(newAnswers);
    if (!correct) {
      setShowFeedback(true);
      setLastUserAnswer(userAnswer);
      return;
    }

    if (index + 1 >= questions.length) {
      const score = newAnswers.filter(a => a.correct).length;
      saveSession({ profile, date: Date.now(), score });
      navigate('/resultats', { state: { answers: newAnswers, profile } });
    } else {
      setIndex(i => i + 1);
    }
  };

  const continueAfterFeedback = () => {
    setShowFeedback(false);
    if (index + 1 >= questions.length) {
      const score = answers.filter(a => a.correct).length;
      saveSession({ profile, date: Date.now(), score });
      navigate('/resultats', { state: { answers, profile } });
    } else {
      setIndex(i => i + 1);
    }
  };

  const wrapperClass = 'min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-10 text-slate-100';

  if (status === 'loading') {
    return (
      <div className={wrapperClass}>
        <div className="mx-auto max-w-3xl rounded-[2.75rem] surface-dark p-10 text-center text-xl font-semibold text-slate-200 shadow-2xl">
          Chargement du quiz...
        </div>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className={wrapperClass}>
        <div className="mx-auto max-w-3xl space-y-6 rounded-[2.75rem] surface-dark p-10 text-center text-lg text-slate-200 shadow-2xl">
          <p>Aucune question n'est disponible pour le moment.</p>
          <p>
            Rendez-vous sur la page <Link to="/admin" className="font-semibold text-white underline">Importer / Mettre à jour le CSV</Link> pour ajouter des questions.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={wrapperClass}>
        <div className="mx-auto max-w-3xl space-y-6 rounded-[2.75rem] surface-dark p-10 text-center text-lg text-slate-200 shadow-2xl">
          <p>Impossible de charger les questions.</p>
          {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
          <button onClick={() => window.location.reload()} className="btn-red">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const q = questions[index];
  if (!q) {
    return (
      <div className={wrapperClass}>
        <div className="mx-auto max-w-3xl rounded-[2.75rem] surface-dark p-10 text-center text-lg text-slate-200 shadow-2xl">
          Aucune question à afficher.
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass} aria-live="polite">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="rounded-[2.75rem] surface-dark px-8 py-8 shadow-2xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Séance en cours</p>
              <h1 className="text-3xl font-extrabold text-white">Question {index + 1} / {questions.length}</h1>
            </div>
            <div className="rounded-3xl bg-gray-800/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-slate-200 shadow">
              Profil : {profile}
            </div>
          </div>
        </header>

        <main className="rounded-[2.75rem] surface-dark p-8 text-lg leading-relaxed text-slate-100 shadow-2xl">
          <h2 className="text-2xl font-bold text-white">{q.question}</h2>
          <p className="mt-2 text-base text-slate-300">Répondez en prenant votre temps. Chaque bouton et champ est volontairement large pour votre confort.</p>
          <div className="mt-6">
            {!showFeedback ? (
              <QuestionRenderer question={q} onAnswer={handleAnswer} />
            ) : (
              <div className="rounded-3xl bg-gray-800/80 p-6 shadow-inner" aria-live="polite">
                <p className="text-lg font-semibold text-red-400">Mauvaise réponse</p>
                <p className="mt-2 text-slate-200">Bonne réponse : <span className="font-semibold">{JSON.stringify(q.answer)}</span></p>
                {q.pagePDF && (
                  <div className="mt-3">
                    <PDFLink page={q.pagePDF} motCle={q.motClePDF} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={continueAfterFeedback}
                  className="btn-red mt-4"
                >
                  Continuer
                </button>
              </div>
            )}
          </div>
          {q.pagePDF && (
            <div className="mt-6">
              <PDFLink page={q.pagePDF} motCle={q.motClePDF} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

