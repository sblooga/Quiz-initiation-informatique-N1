import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { loadQuestions, saveSession } from '../lib/db.indexeddb';
import { Question } from '../lib/types';
import { shuffle, seedFromProfile } from '../lib/random';
import QuestionRenderer from '../components/QuestionRenderer';
import PDFLink from '../components/PDFLink';

const quizVisual = 'https://images.unsplash.com/photo-1500043208383-7f1a9a3c7483?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

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

    if (index + 1 >= questions.length) {
      const score = newAnswers.filter(a => a.correct).length;
      saveSession({ profile, date: Date.now(), score });
      navigate('/resultats', { state: { answers: newAnswers, profile } });
    } else {
      setIndex(i => i + 1);
    }
  };

  const wrapperClass = 'min-h-screen bg-gradient-to-br from-pastel-lavender via-pastel-rose to-pastel-sky px-4 py-10 text-slate-800';

  if (status === 'loading') {
    return (
      <div className={wrapperClass}>
        <div className="mx-auto max-w-3xl rounded-[2.75rem] bg-white/80 p-10 text-center text-xl font-semibold text-slate-700 shadow-2xl">
          Chargement du quiz...
        </div>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className={wrapperClass}>
        <div className="mx-auto max-w-3xl space-y-6 rounded-[2.75rem] bg-white/80 p-10 text-center text-lg text-slate-700 shadow-2xl">
          <p>Aucune question n'est disponible pour le moment.</p>
          <p>
            Rendez-vous sur la page <Link to="/admin" className="font-semibold text-slate-900 underline">Importer / Mettre à jour le CSV</Link> pour ajouter des questions.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={wrapperClass}>
        <div className="mx-auto max-w-3xl space-y-6 rounded-[2.75rem] bg-white/80 p-10 text-center text-lg text-slate-700 shadow-2xl">
          <p>Impossible de charger les questions.</p>
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          <button onClick={() => window.location.reload()} className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700">
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
        <div className="mx-auto max-w-3xl rounded-[2.75rem] bg-white/80 p-10 text-center text-lg text-slate-700 shadow-2xl">
          Aucune question à afficher.
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass} aria-live="polite">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="overflow-hidden rounded-[2.75rem] bg-white/80 shadow-2xl">
          <div className="relative">
            <img src={quizVisual} alt="Illustration de quiz" className="h-56 w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-pastel-lavender/80 via-transparent to-pastel-rose/60" aria-hidden="true" />
            <div className="relative flex flex-col gap-2 px-8 py-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.5em] text-slate-600">Séance en cours</p>
                <h1 className="text-3xl font-extrabold text-slate-900">Question {index + 1} / {questions.length}</h1>
              </div>
              <div className="rounded-3xl bg-white/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-slate-700 shadow">
                Profil : {profile}
              </div>
            </div>
          </div>
        </header>

        <main className="rounded-[2.75rem] bg-white/90 p-8 text-lg leading-relaxed text-slate-800 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-900">{q.question}</h2>
          <p className="mt-2 text-base text-slate-600">Répondez en prenant votre temps. Chaque bouton et champ est volontairement large pour votre confort.</p>
          <div className="mt-6">
            <QuestionRenderer question={q} onAnswer={handleAnswer} />
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
