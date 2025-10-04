import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadQuestions, saveSession } from '../lib/db.indexeddb';
import { Question } from '../lib/types';
import { shuffle, seedFromProfile } from '../lib/random';
import QuestionRenderer from '../components/QuestionRenderer';
import PDFLink from '../components/PDFLink';

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

  useEffect(() => {
    (async () => {
      const all = await loadQuestions();
      const seed = seedFromProfile(profile, Date.now());
      const shuffled = shuffle(all, seed).slice(0, 10);
      setQuestions(shuffled);
    })();
  }, [profile]);

  const handleAnswer = (correct: boolean, userAnswer: any) => {
    const current = questions[index];
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

  if (questions.length === 0) return <div className="p-4">Chargement…</div>;

  const q = questions[index];

  return (
    <div className="p-4 space-y-4" aria-live="polite">
      <div>{index + 1} / {questions.length}</div>
      <div className="font-bold">{q.question}</div>
      <QuestionRenderer question={q} onAnswer={handleAnswer} />
      {q.pagePDF && <PDFLink page={q.pagePDF} motCle={q.motClePDF} />}
    </div>
  );
}
