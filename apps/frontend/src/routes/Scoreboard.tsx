import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProfiles } from '../lib/profiles';
import { fetchSessions, Session } from '../services/quizApiService';

interface ChartDatum {
  profile: string;
  average: number;
  best: number;
  sessions: Array<{ date: number; score: number }>;
  color: string;
}

function formatScore(score: number) {
  return `${score.toFixed(1)}/10`;
}

export default function Scoreboard() {
  const location = useLocation();
  const { profiles } = useProfiles();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');

  useEffect(() => {
    fetchSessions().then(setSessions).catch(console.error);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedProfile = params.get('profile');
    if (requestedProfile) {
      setSelectedProfile(requestedProfile);
    }
  }, [location.search]);

  const chartData = useMemo<ChartDatum[]>(() => {
    const groups = new Map<string, Array<{ date: number; score: number }>>();

    // Map sessions by profile name
    sessions.forEach(session => {
      const profile = profiles.find(p => p.id === String(session.profileId));
      if (!profile) return; // Skip sessions for deleted profiles

      if (!groups.has(profile.name)) {
        groups.set(profile.name, []);
      }
      groups.get(profile.name)!.push({ date: session.date, score: session.score });
    });

    return Array.from(groups.entries())
      .filter(([profileName]) => profiles.some(p => p.name === profileName))
      .map(([profile, entries]) => {
        const best = entries.reduce((max, current) => Math.max(max, current.score), 0);
        const average = entries.reduce((sum, current) => sum + current.score, 0) / entries.length;
        const profileMeta = profiles.find(p => p.name === profile);
        return {
          profile,
          best,
          average,
          sessions: entries.sort((a, b) => b.date - a.date),
          color: profileMeta?.color ?? '#374151'
        };
      });
  }, [profiles, sessions]);

  useEffect(() => {
    if (!selectedProfile && chartData.length) {
      setSelectedProfile(chartData[0].profile);
    }
  }, [chartData, selectedProfile]);

  const active = chartData.find(item => item.profile === selectedProfile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-6 sm:px-6 sm:py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-10 rounded-[2rem] sm:rounded-[2.75rem] surface-dark p-4 sm:p-8 shadow-2xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-400">Suivi des progrès</p>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white md:text-4xl">Scores & graphiques</h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300">
              Visualisez l'évolution des résultats pour chaque élève. Les barres représentent les meilleurs scores, la ligne le score moyen.
            </p>
          </div>
          <Link to="/" className="btn-red text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 text-center">Retour à l'accueil</Link>
        </header>

        <section className="rounded-3xl bg-gray-800/70 p-4 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Vue d'ensemble</h2>
          {chartData.length ? (
            <div className="mt-4 sm:mt-6 space-y-4">
              {chartData.map(item => (
                <div key={item.profile} className="rounded-3xl bg-gray-900/60 p-4 sm:p-5 shadow-inner">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-white">{item.profile}</p>
                      <p className="text-xs sm:text-sm text-slate-300">{item.sessions.length} tentative(s) · Moyenne {formatScore(item.average)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(item.profile)}
                      className={`btn-red px-3 py-1.5 sm:px-5 sm:py-2 text-xs ${selectedProfile === item.profile ? '' : ''}`}
                    >
                      Voir le détail
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-4 h-3 sm:h-4 w-full rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(item.best / 10) * 100}%`, background: item.color }}
                      aria-label={`Meilleur score ${item.best}/10`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 sm:mt-6 rounded-3xl bg-gray-800/70 p-4 sm:p-6 text-center text-sm sm:text-base text-slate-300 shadow-inner">
              Aucun résultat n'a encore été enregistré. Lancez un quiz pour alimenter ce tableau.
            </p>
          )}
        </section>

        {active && (
          <section className="rounded-3xl bg-gray-800/70 p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Historique de {active.profile}</h2>
            <p className="text-xs sm:text-sm text-slate-300">Les points représentent les scores obtenus. Passez la souris pour voir la date.</p>
            <div className="mt-4 sm:mt-6 overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900 to-gray-800 p-4 sm:p-6 shadow-inner">
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 min-w-max">
                  {active.sessions.map(session => {
                    const height = Math.max(12, (session.score / 10) * 100);
                    return (
                      <div key={session.date} className="flex flex-col items-center gap-2">
                        <div className="relative flex h-24 sm:h-32 w-8 sm:w-12 items-end justify-center rounded-full bg-gray-800">
                          <div
                            className="w-6 sm:w-8 rounded-t-full"
                            style={{ height: `${height}%`, background: active.color }}
                            title={`${session.score}/10 - ${new Date(session.date).toLocaleDateString()}`}
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-300">{session.score}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

