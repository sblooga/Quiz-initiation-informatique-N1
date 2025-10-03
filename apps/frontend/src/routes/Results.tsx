import { useLocation, Link } from 'react-router-dom';
import ScoreCard from '../components/ScoreCard';
import PDFLink from '../components/PDFLink';
interface AnswerRecord {
  question: any;
  user: any;
  correct: boolean;
}

interface LocationState {
  answers: AnswerRecord[];
  profile: string;
}

export default function Results() {
  const { state } = useLocation();
  const { answers, profile } = (state as LocationState) || { answers: [], profile: 'Anonyme' };
  const score = answers.filter(a => a.correct).length;
  const mistakes = answers.filter(a => !a.correct);

  return (
    <div className="p-4 space-y-4">
      <ScoreCard score={score} />
      {mistakes.length > 0 && (
        <div>
          <h3 className="font-bold">Réponses à revoir :</h3>
          <ul className="list-disc ml-5 space-y-2">
            {mistakes.map((m, idx) => (
              <li key={idx}>
                <div>{m.question.question}</div>
                <div>Votre réponse : {JSON.stringify(m.user)}</div>
                <div>Bonne réponse : {JSON.stringify(m.question.answer)}</div>
                {m.question.pagePDF && <PDFLink page={m.question.pagePDF} motCle={m.question.motClePDF} />}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link to="/" className="underline">Retour à l'accueil</Link>
    </div>
  );
}
