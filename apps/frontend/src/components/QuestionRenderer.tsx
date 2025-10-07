import { useEffect, useState } from 'react';
import { Question } from '../lib/types';
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
    const correct = val === (question as any).answer;
    onAnswer(correct, val);
  };

  const handleCompleter = () => {
    const val = input;
    const normalized = normalize(val);
    const expected = Array.isArray((question as any).answer) ? (question as any).answer : [(question as any).answer];
    const correct = expected.some((a: string) => normalize(a) === normalized);
    onAnswer(correct, val);
  };

  const handleAssocier = (pairs: Array<{ gauche: string; droite: string }>) => {
    const correct = pairs.every(p => {
      return (question as any).pairs!.some((qp: any) => normalize(qp.gauche) === normalize(p.gauche) && normalize(qp.droite) === normalize(p.droite));
    });
    onAnswer(correct, pairs);
  };

  const t = (question as any).type as string;
  if (t === 'QCM') return <ChoiceList choices={(question as any).choices} onSelect={handleChoice} />;
  if (t === 'Vrai/Faux') {
    return (
      <div className="flex flex-wrap gap-4">
        <button onClick={() => handleVF('Vrai')} className="btn-red">Vrai</button>
        <button onClick={() => handleVF('Faux')} className="btn-red">Faux</button>
      </div>
    );
  }
  if (t === 'Associer') return <MatchPairs pairs={(question as any).pairs!} onSubmit={handleAssocier} />;
  if (t.includes('Compl')) {
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
  }

  return <div>Type inconnu</div>;
}

