interface Props {
  choices: string[];
  onSelect: (choice: string) => void;
}

export default function ChoiceList({ choices, onSelect }: Props) {
  return (
    <div className="flex flex-col space-y-2">
      {choices.map(c => (
        <button key={c} onClick={() => onSelect(c)} className="border p-2 rounded" aria-label={c}>{c}</button>
      ))}
    </div>
  );
}
