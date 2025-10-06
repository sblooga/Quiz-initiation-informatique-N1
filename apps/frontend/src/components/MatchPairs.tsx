import { useState } from 'react';

interface Pair { gauche: string; droite: string; }
interface Props {
  pairs: Pair[];
  onSubmit: (answer: Pair[]) => void;
}

export default function MatchPairs({ pairs, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const options = pairs.map(p => p.droite);

  const handleChange = (gauche: string, value: string) => {
    setAnswers(a => ({ ...a, [gauche]: value }));
  };

  const submit = () => {
    onSubmit(pairs.map(p => ({ gauche: p.gauche, droite: answers[p.gauche] })));
  };

  return (
    <div className="space-y-4">
      {pairs.map(pair => (
        <div key={pair.gauche} className="flex flex-col gap-2 rounded-3xl bg-pastel-butter/60 p-4 shadow">
          <span className="text-lg font-semibold text-slate-800">{pair.gauche}</span>
          <select
            onChange={event => handleChange(pair.gauche, event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 focus:border-slate-500 focus:outline-none"
          >
            <option value="">Choisir...</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ))}
      <button
        onClick={submit}
        className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700"
      >
        Valider
      </button>
    </div>
  );
}
