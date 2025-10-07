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
        <div key={pair.gauche} className="flex flex-col gap-2 rounded-3xl bg-gray-800/70 p-4 shadow">
          <span className="text-lg font-semibold text-slate-100">{pair.gauche}</span>
          <select
            onChange={event => handleChange(pair.gauche, event.target.value)}
            className="input-dark w-full rounded-2xl px-4 py-3 text-base"
          >
            <option value="">Choisir...</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      ))}
      <button onClick={submit} className="btn-red">Valider</button>
    </div>
  );
}
