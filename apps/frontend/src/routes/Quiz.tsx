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

    setAnswers(a => [...a, { question: current, user: userAnswer, correct }]);

    if (index + 1 >= questions.length) {
      const allAnswers = [...answers, { question: current, user: userAnswer, correct }];
      const score = allAnswers.filter(a => a.correct).length;
      saveSession({ profile, date: Date.now(), score });
      navigate('/resultats', { state: { answers: allAnswers, profile } });
    } else {
      setIndex(i => i + 1);
    }
  };

  if (status === 'loading') {
    return <div className="p-4">Chargement...</div>;
  }

  if (status === 'empty') {
    return (
      <div className="p-4 space-y-4">
        <p>Aucune question n'est disponible pour le moment.</p>
        <p>
          Rendez-vous sur la page <Link to="/admin" className="underline">Importer / Mettre a jour le CSV</Link> pour ajouter des questions.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 space-y-4">
        <p>Impossible de charger les questions.</p>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <button onClick={() => window.location.reload()} className="underline">
          Reessayer
        </button>
      </div>
    );
  }

  const q = questions[index];
  if (!q) {
    return <div className="p-4">Aucune question a afficher.</div>;
  }

  return (
    <div className="p-4 space-y-4" aria-live="polite">
      <div>{index + 1} / {questions.length}</div>
      <div className="font-bold">{q.question}</div>
      <QuestionRenderer question={q} onAnswer={handleAnswer} />
      {q.pagePDF && <PDFLink page={q.pagePDF} motCle={q.motClePDF} />}
    </div>
  );
}

