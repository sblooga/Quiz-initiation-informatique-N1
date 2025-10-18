import { Question } from '../lib/types';

interface Props {
  question: Question;
}

export default function Answer({ question }: Props) {
  switch (question.type) {
    case 'QCM':
    case 'Compléter':
      if (Array.isArray(question.answer)) {
        return <span>{question.answer.join(', ')}</span>;
      }
      return <span>{question.answer}</span>;
    case 'Vrai/Faux':
      return <span>{question.answer}</span>;
    case 'Associer':
      return (
        <ul>
          {question.pairs.map(pair => (
            <li key={pair.gauche}>
              {pair.gauche} → {pair.droite}
            </li>
          ))}
        </ul>
      );
    default:
      return <span>Type de question non supporté</span>;
  }
}