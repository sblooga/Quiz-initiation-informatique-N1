import { useState, useEffect } from 'react';

export default function HighContrastToggle() {
  const [high, setHigh] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', high ? 'high' : '');
  }, [high]);

  return (
    <button
      onClick={() => setHigh(h => !h)}
      className="rounded-full bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 shadow transition hover:bg-white"
    >
      {high ? 'Contraste normal' : 'Contraste élevé'}
    </button>
  );
}
