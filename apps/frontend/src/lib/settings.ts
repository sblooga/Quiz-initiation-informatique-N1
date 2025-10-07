export type Settings = {
  adminCode: string;
  teacherPhotoUrl: string;
  courseSummary: string;
};

const STORAGE_KEY = 'quiz-n1-settings-v1';

const defaultSettings: Settings = {
  adminCode: '00000',
  teacherPhotoUrl: '',
  courseSummary:
    "Pas à pas, je vous guide pour gagner en confiance avec l'ordinateur. Prenez votre temps, je suis là pour vous !",
};

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(next: Partial<Settings> | ((prev: Settings) => Partial<Settings>)) {
  if (typeof window === 'undefined') return;
  const prev = getSettings();
  const patch = typeof next === 'function' ? (next as (prev: Settings) => Partial<Settings>)(prev) : next;
  const merged = { ...prev, ...patch } as Settings;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event('settings-updated'));
}

import { useEffect, useState } from 'react';

export function useSettings(): [Settings, (next: Partial<Settings> | ((prev: Settings) => Partial<Settings>)) => void] {
  const [settings, setSettings] = useState<Settings>(() => getSettings());

  useEffect(() => {
    const refresh = () => setSettings(getSettings());
    window.addEventListener('settings-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('settings-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const set = (next: Partial<Settings> | ((prev: Settings) => Partial<Settings>)) => {
    saveSettings(next);
    setSettings(getSettings());
  };

  return [settings, set];
}

