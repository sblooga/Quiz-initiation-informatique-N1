import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllSessions, SessionItem } from '../lib/db.indexeddb';
import { useProfiles } from '../lib/profiles';

interface ChartDatum {
  profile: string;
  average: number;
  best: number;
  sessions: SessionItem[];
  color: string;
}

function formatScore(score: number) {
  return `${score.toFixed(1)}/10`;
}

export default function Scoreboard() {
  const location = useLocation();
  const { profiles } = useProfiles();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');

  useEffect(() => {
    getAllSessions().then(setSessions);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedProfile = params.get('profile');
    if (requestedProfile) {
      setSelectedProfile(requestedProfile);
    }
  }, [location.search]);

  const chartData = useMemo<ChartDatum[]>(() => {
    const groups = new Map<string, SessionItem[]>();
    sessions.forEach(session => {
      if (!groups.has(session.profile)) {
        groups.set(session.profile, []);
      }
      groups.get(session.profile)!.push(session);
    });

    return Array.from(groups.entries()).map(([profile, entries]) => {
      const best = entries.reduce((max, current) => Math.max(max, current.score), 0);
      const average = entries.reduce((sum, current) => sum + current.score, 0) / entries.length;
      const profileMeta = profiles.find(p => p.name === profile);
      return {
        profile,
        best,
        average,
        sessions: entries.sort((a, b) => b.date - a.date),
        color: profileMeta?.color ?? '#d9cffc'
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
    <div className="min-h-screen bg-gradient-to-br from-pastel-sky via-pastel-lavender to-pastel-rose px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-6xl space-y-10 rounded-[2.75rem] bg-white/80 p-8 shadow-2xl backdrop-blur">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Suivi des progrès</p>
            <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Scores &amp; graphiques</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Visualisez l'évolution des résultats pour chaque élève. Les barres représentent les meilleurs scores, la ligne le score moyen.
            </p>
          </div>
          <Link to="/" className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg transition hover:bg-slate-700">
            Retour à l'accueil
          </Link>
        </header>

        <section className="rounded-3xl bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800">Vue d'ensemble</h2>
          {chartData.length ? (
            <div className="mt-6 space-y-4">
              {chartData.map(item => (
                <div key={item.profile} className="rounded-3xl bg-white/90 p-5 shadow-inner">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{item.profile}</p>
                      <p className="text-sm text-slate-600">{item.sessions.length} tentative(s) • Moyenne {formatScore(item.average)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(item.profile)}
                      className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] shadow ${selectedProfile === item.profile ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 hover:bg-slate-100'}`}
                    >
                      Voir le détail
                    </button>
                  </div>
                  <div className="mt-4 h-4 w-full rounded-full bg-slate-100">
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
            <p className="mt-6 rounded-3xl bg-white/80 p-6 text-center text-slate-600 shadow-inner">
              Aucun résultat n'a encore été enregistré. Lancez un quiz pour alimenter ce tableau.
            </p>
          )}
        </section>

        {active && (
          <section className="rounded-3xl bg-white/90 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800">Historique de {active.profile}</h2>
            <p className="text-sm text-slate-600">Les points représentent les scores obtenus. Passez la souris pour voir la date.</p>
            <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-b from-white to-slate-50 p-6 shadow-inner">
              <div className="grid grid-cols-12 gap-2">
                {active.sessions.map(session => {
                  const height = Math.max(12, (session.score / 10) * 100);
                  return (
                    <div key={session.date} className="col-span-3 flex flex-col items-center gap-2 sm:col-span-2 lg:col-span-1">
                      <div className="relative flex h-32 w-12 items-end justify-center rounded-full bg-slate-100">
                        <div
                          className="w-8 rounded-t-full"
                          style={{ height: `${height}%`, background: active.color }}
                          title={`${session.score}/10 - ${new Date(session.date).toLocaleDateString()}`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{session.score}/10</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
