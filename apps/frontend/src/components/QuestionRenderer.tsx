import { useState } from 'react';
import { Question } from '../lib/types';
import ChoiceList from './ChoiceList';
import MatchPairs from './MatchPairs';
import PDFLink from './PDFLink';
import { normalize } from '../lib/normalize';

interface Props {
  question: Question;
  onAnswer: (correct: boolean, userAnswer: any) => void;
}

export default function QuestionRenderer({ question, onAnswer }: Props) {
  const [input, setInput] = useState('');

  const handleChoice = (choice: string) => {
    const correct = Array.isArray(question.answer)
      ? (question.answer as string[]).some(a => normalize(a) === normalize(choice))
      : normalize(choice) === normalize(question.answer as string);
    onAnswer(correct, choice);
  };

  const handleVF = (val: 'Vrai' | 'Faux') => {
    const correct = val === question.answer;
    onAnswer(correct, val);
  };

  const handleCompleter = () => {
    const val = input;
    const normalized = normalize(val);
    const expected = Array.isArray(question.answer) ? question.answer : [question.answer];
    const correct = expected.some(a => normalize(a) === normalized);
    onAnswer(correct, val);
  };

  const handleAssocier = (pairs: Array<{ gauche: string; droite: string }>) => {
    const correct = pairs.every(p => {
      return question.pairs!.some(qp => normalize(qp.gauche) === normalize(p.gauche) && normalize(qp.droite) === normalize(p.droite));
    });
    onAnswer(correct, pairs);
  };

  switch (question.type) {
    case 'QCM':
      return <ChoiceList choices={question.choices} onSelect={handleChoice} />;
    case 'Vrai/Faux':
      return (
        <div className="space-x-4">
          <button onClick={() => handleVF('Vrai')} className="border p-2 rounded">Vrai</button>
          <button onClick={() => handleVF('Faux')} className="border p-2 rounded">Faux</button>
        </div>
      );
    case 'Compléter':
      return (
        <div className="space-x-2">
          <input value={input} onChange={e => setInput(e.target.value)} className="border p-2" />
          <button onClick={handleCompleter} className="border p-2 rounded">Valider</button>
        </div>
      );
    case 'Associer':
      return <MatchPairs pairs={question.pairs!} onSubmit={handleAssocier} />;
    default:
      return <div>Type inconnu</div>;
  }
}
