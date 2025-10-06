interface Props {
  choices: string[];
  onSelect: (choice: string) => void;
}

export default function ChoiceList({ choices, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {choices.map(choice => (
        <button
          key={choice}
          onClick={() => onSelect(choice)}
          className="rounded-3xl border-2 border-transparent bg-pastel-mint/60 px-6 py-4 text-left text-lg font-semibold text-slate-800 shadow transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white"
          aria-label={choice}
        >
          {choice}
        </button>
      ))}
    </div>
  );
}
