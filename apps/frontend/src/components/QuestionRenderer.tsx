import { useEffect, useState } from 'react';
import { Question, QCMQuestion, VFQuestion, CompleterQuestion, AssocierQuestion } from '../types';
import ChoiceList from './ChoiceList';
import MatchPairs from './MatchPairs';
import { normalize } from '../lib/normalize';

interface Props {
  question: Question;
  onAnswer: (correct: boolean, userAnswer: any) => void;
}

export default function QuestionRenderer({ question, onAnswer }: Props) {
  const [input, setInput] = useState('');

  useEffect(() => {
    setInput('');
  }, [question]);

  const handleChoice = (choice: string) => {
    const correct = Array.isArray(question.answer)
      ? (question.answer as string[]).some(a => normalize(a) === normalize(choice))
      : normalize(choice) === normalize(question.answer as string);
    onAnswer(correct, choice);
  };

  const handleVF = (val: 'Vrai' | 'Faux') => {
    const q = question as VFQuestion;
    const correct = val === q.answer;
    onAnswer(correct, val);
  };

  const handleCompleter = () => {
    const q = question as CompleterQuestion;
    const val = input;
    const normalized = normalize(val);
    const expected = Array.isArray(q.answer) ? q.answer : [q.answer];
    const correct = expected.some((a: string) => normalize(a) === normalized);
    onAnswer(correct, val);
  };

  const handleAssocier = (pairs: Array<{ gauche: string; droite: string }>) => {
    const q = question as AssocierQuestion;
    const correct = pairs.every(p => {
      return q.answer.some((qa: any) => normalize(qa.gauche) === normalize(p.gauche) && normalize(qa.droite) === normalize(p.droite));
    });
    onAnswer(correct, pairs);
  };

  switch (question.type) {
    case 'QCM':
      return <ChoiceList choices={(question as QCMQuestion).choices} onSelect={handleChoice} />;
    case 'Vrai/Faux':
      return (
        <div className="flex flex-wrap gap-4">
          <button onClick={() => handleVF('Vrai')} className="btn-red">Vrai</button>
          <button onClick={() => handleVF('Faux')} className="btn-red">Faux</button>
        </div>
      );
    case 'Associer':
        const q = question as AssocierQuestion;
        const pairs = q.choices.map((choice, i) => ({ gauche: choice, droite: q.answer[i] as string }));
      return <MatchPairs pairs={pairs} onSubmit={handleAssocier} />;
    case 'Compléter':
      return (
        <form
          onSubmit={event => {
            event.preventDefault();
            handleCompleter();
          }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <label className="flex-1">
            <span className="sr-only">Votre réponse</span>
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              className="input-dark w-full rounded-2xl px-4 py-3 text-lg shadow-inner"
              placeholder="Écrivez votre réponse ici"
              aria-label="Votre réponse"
              autoFocus
            />
          </label>
          <button type="submit" className="btn-red">Valider</button>
        </form>
      );
    default:
      return <div>Type inconnu</div>;
  }
}

