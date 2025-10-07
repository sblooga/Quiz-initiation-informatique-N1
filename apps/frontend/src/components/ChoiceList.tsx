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
          className="btn-red text-left text-base"
          aria-label={choice}
        >
          {choice}
        </button>
      ))}
    </div>
  );
}
