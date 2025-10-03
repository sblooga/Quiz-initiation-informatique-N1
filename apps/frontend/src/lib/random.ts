// Générateur pseudo-aléatoire simple basé sur seed
export function seedFromProfile(name: string, timestamp: number) {
  let hash = 0;
  const str = name + timestamp;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function shuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let currentSeed = seed;
  for (let i = result.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
