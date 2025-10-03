interface Props {
  score: number;
}

export default function ScoreCard({ score }: Props) {
  const message = score <= 3 ? 'Courage, continuez à pratiquer !'
    : score <= 6 ? 'Bon début, persévérez !'
    : score <= 8 ? 'Très bien, encore un petit effort !'
    : 'Excellent, bravo !';
  return (
    <div className="p-4 border rounded text-center space-y-2">
      <h2 className="text-xl font-bold">Score {score}/10</h2>
      <p>{message}</p>
    </div>
  );
}
