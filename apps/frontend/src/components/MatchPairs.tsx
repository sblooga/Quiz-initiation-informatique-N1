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
    <div className="space-y-2">
      {pairs.map(p => (
        <div key={p.gauche} className="flex items-center space-x-2">
          <span>{p.gauche}</span>
          <select onChange={e => handleChange(p.gauche, e.target.value)} className="border p-1">
            <option value="">--</option>
            {options.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      ))}
      <button onClick={submit} className="mt-2 border p-2 rounded">Valider</button>
    </div>
  );
}
