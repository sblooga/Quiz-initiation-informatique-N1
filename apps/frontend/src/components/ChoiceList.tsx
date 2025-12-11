import { useState } from 'react';

interface Props {
  choices: string[];
  onSelect: (choices: string[]) => void;
}

export default function ChoiceList({ choices, onSelect }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (choice: string) => {
    setSelected(prev =>
      prev.includes(choice)
        ? prev.filter(c => c !== choice)
        : [...prev, choice]
    );
  };

  const handleValidate = () => {
    if (selected.length > 0) {
      onSelect(selected);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        {choices.map(choice => {
          const isSelected = selected.includes(choice);
          return (
            <button
              key={choice}
              onClick={() => toggleSelection(choice)}
              className={`text-left text-sm sm:text-base transition-all duration-200 flex items-center gap-3 ${isSelected
                ? 'btn-red ring-4 ring-white/30 scale-[1.02]'
                : 'btn-red opacity-90 hover:opacity-100'
                }`}
              aria-label={choice}
              aria-pressed={isSelected}
            >
              <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? 'border-white bg-white text-red-600' : 'border-white/50 bg-transparent'
                }`}>
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span>{choice}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleValidate}
          disabled={selected.length === 0}
          className="btn-red px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Valider ma réponse
        </button>
      </div>
    </div>
  );
}
