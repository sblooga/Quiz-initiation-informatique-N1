import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Answer from '../components/Answer';
import PDFLink from '../components/PDFLink';
import QuestionRenderer from '../components/QuestionRenderer';
import { seedFromProfile, shuffle } from '../lib/random';
import { Question } from '../lib/types';
import { fetchQuestions, fetchStudents, saveSession as saveSessionAPI } from '../services/quizApiService';

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
        const apiQuestions = await fetchQuestions();

        if (cancelled) return;

        if (!apiQuestions.length) {
          setQuestions([]);
          setStatus('empty');
          return;
        }

        const all: Question[] = apiQuestions.map(q => {
          // Parse answer: if it contains pipes, it's a multiple-choice answer
          let answer: string | string[] = q.answer.text || '';
          if (typeof answer === 'string' && answer.includes('|')) {
            answer = answer.split('|').map(a => a.trim()).filter(Boolean);
          }

          return {
            id: String(q.id),
            type: q.type === 'VraiFaux' ? 'Vrai/Faux' : q.type,
            question: q.label,
            theme: q.meta.theme || '',
            referenceCours: q.meta.courseRef || '',
            motClePDF: q.meta.pdfKeyword || undefined,
            lesson: q.meta.lesson || undefined,
            pagePDF: q.meta.pdfPage || undefined,
            pdfSearchText: q.meta.pdfSearchText || undefined,
            choices: q.choices,
            answer,
          } as Question;
        });

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
      // Find profile ID by name
      fetchStudents().then(students => {
        const student = students.find(s => s.name === profile);
        if (student) {
          saveSessionAPI(student.id, Date.now(), score).catch(console.error);
        }
      });
      navigate('/resultats', { state: { answers: newAnswers, profile } });
    } else {
      setIndex(i => i + 1);
    }
  };

  const continueAfterFeedback = () => {
    setShowFeedback(false);
    if (index + 1 >= questions.length) {
      const score = answers.filter(a => a.correct).length;
      // Find profile ID by name
      fetchStudents().then(students => {
        const student = students.find(s => s.name === profile);
        if (student) {
          saveSessionAPI(student.id, Date.now(), score).catch(console.error);
        }
      });
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
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:gap-8">
        <header className="rounded-[2rem] sm:rounded-[2.75rem] surface-dark px-4 py-4 sm:px-8 sm:py-8 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-6">
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-400">Séance en cours</p>
                <h1 className="text-xl sm:text-3xl font-extrabold text-white">Question {index + 1} / {questions.length}</h1>
              </div>
              <div className="rounded-3xl bg-gray-800/80 px-3 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-slate-200 shadow">
                Profil : {profile}
              </div>
            </div>
            <Link to="/" className="btn-red px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm">
              ← Quitter
            </Link>
          </div>
        </header>

        <main className="rounded-[2rem] sm:rounded-[2.75rem] surface-dark p-4 sm:p-8 text-base sm:text-lg leading-relaxed text-slate-100 shadow-2xl">
          <h2 className="text-lg sm:text-2xl font-bold text-white">{q.question}</h2>
          <p className="mt-2 text-base text-slate-300">Répondez en prenant votre temps. Chaque bouton et champ est volontairement large pour votre confort.</p>
          <div className="mt-6">
            {!showFeedback ? (
              <QuestionRenderer question={q} onAnswer={handleAnswer} />
            ) : (
              <div className="rounded-3xl bg-gray-800/80 p-6 shadow-inner" aria-live="polite">
                <p className="text-lg font-semibold text-red-400">Mauvaise réponse</p>
                <p className="mt-2 text-slate-200">Bonne réponse : <Answer question={q} /></p>
                {(q.lesson || q.pagePDF || q.pdfSearchText) && (
                  <div className="mt-3">
                    <PDFLink lesson={q.lesson} page={q.pagePDF} motCle={q.motClePDF} searchText={q.pdfSearchText} />
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
          {(q.lesson || q.pagePDF || q.pdfSearchText) && (
            <div className="mt-6">
              <PDFLink lesson={q.lesson} page={q.pagePDF} motCle={q.motClePDF} searchText={q.pdfSearchText} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

