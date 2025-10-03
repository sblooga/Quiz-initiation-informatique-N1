import { useEffect, useState } from 'react';
import { getSessions } from '../lib/db.indexeddb';

export default function Scoreboard() {
  const [profile, setProfile] = useState('');
  const [sessions, setSessions] = useState<{ date: number; score: number }[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('profile') || 'Anonyme';
    setProfile(p);
    getSessions(p).then(setSessions);
  }, []);

  const best = sessions.reduce((m, s) => Math.max(m, s.score), 0);
  const last = sessions[0]?.score;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Classement de {profile}</h2>
      <div>Meilleur score : {best}/10</div>
      <div>Dernier score : {last ?? 'N/A'}/10</div>
      <ul className="list-disc ml-5">
        {sessions.map((s, i) => (
          <li key={i}>{new Date(s.date).toLocaleDateString()} – {s.score}/10</li>
        ))}
      </ul>
    </div>
  );
}
