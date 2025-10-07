interface Props {
  score: number;
}

export default function ScoreCard({ score }: Props) {
  const message = score <= 3 ? 'Courage, continuez à pratiquer !'
    : score <= 6 ? 'Bon début, persévérez !'
    : score <= 8 ? 'Très bien, encore un petit effort !'
    : 'Excellent, bravo !';
  return (
    <div className="relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-[1px] shadow-xl">
      <div className="rounded-[2.25rem] bg-gray-900/90 p-8 text-center text-slate-100">
        <h2 className="text-3xl font-extrabold text-white">Score {score}/10</h2>
        <p className="mt-2 text-lg">{message}</p>
      </div>
    </div>
  );
}

