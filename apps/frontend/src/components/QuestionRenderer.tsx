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
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleVF('Vrai')}
            className="rounded-3xl bg-pastel-mint/70 px-6 py-4 text-lg font-semibold text-slate-800 shadow transition hover:-translate-y-1 hover:bg-white"
          >
            Vrai
          </button>
          <button
            onClick={() => handleVF('Faux')}
            className="rounded-3xl bg-pastel-rose/70 px-6 py-4 text-lg font-semibold text-slate-800 shadow transition hover:-translate-y-1 hover:bg-white"
          >
            Faux
          </button>
        </div>
      );
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
              className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg text-slate-800 shadow-inner focus:border-slate-500 focus:outline-none"
              placeholder="Écrivez votre réponse ici"
              aria-label="Votre réponse"
              autoFocus
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700"
          >
            Valider
          </button>
        </form>
      );
    case 'Associer':
      return <MatchPairs pairs={question.pairs!} onSubmit={handleAssocier} />;
    default:
      return <div>Type inconnu</div>;
  }
}
