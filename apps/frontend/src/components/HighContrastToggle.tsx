import { useState, useEffect } from 'react';

export default function HighContrastToggle() {
  const [high, setHigh] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', high ? 'high' : '');
  }, [high]);

  return (
    <button onClick={() => setHigh(h => !h)} className="border p-2 rounded">
      {high ? 'Contraste normal' : 'Contraste élevé'}
    </button>
  );
}
