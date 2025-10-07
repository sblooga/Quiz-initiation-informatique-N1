import { useCallback, useEffect, useMemo, useState } from 'react';

export interface Profile {
  id: string;
  name: string;
  photo: string;
  color: string;
}

const STORAGE_KEY = 'quiz-n1-profiles-v2';

const pastelPalette = ['#374151', '#4b5563', '#6b7280', '#1f2937', '#111827', '#0f172a'];
const defaultPhotos: string[] = [];
export const PROFILE_PHOTO_LIBRARY: string[] = [];

function randomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

function withDefaults(profile: Partial<Profile>, index: number): Profile {
  return {
    id: profile.id ?? randomId(),
    name: profile.name ?? 'Élève',
    photo: profile.photo ?? '',
    color: profile.color ?? pastelPalette[index % pastelPalette.length]
  };
}

const defaultProfiles: Profile[] = [];

function loadProfilesFromStorage(): Profile[] {
  if (typeof window === 'undefined') {
    return defaultProfiles;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveProfilesToStorage(defaultProfiles);
    return defaultProfiles;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Profile>[];
    return parsed.map((p, index) => withDefaults(p, index));
  } catch (error) {
    console.error('Impossible de lire les profils, réinitialisation.', error);
    return defaultProfiles;
  }
}

function saveProfilesToStorage(profiles: Profile[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  window.dispatchEvent(new Event('profiles-updated'));
}

export function useProfiles() {
  const [profiles, setProfilesState] = useState<Profile[]>(() => loadProfilesFromStorage());

  useEffect(() => {
    const refresh = () => {
      setProfilesState(loadProfilesFromStorage());
    };

    window.addEventListener('storage', refresh);
    window.addEventListener('profiles-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('profiles-updated', refresh);
    };
  }, []);

  const setProfiles = useCallback((updater: Profile[] | ((prev: Profile[]) => Profile[])) => {
    setProfilesState(prev => {
      const computed = typeof updater === 'function' ? (updater as (prev: Profile[]) => Profile[])(prev) : updater;
      const next = computed.map((p, index) => withDefaults(p, index));
      saveProfilesToStorage(next);
      return next;
    });
  }, []);

  return useMemo(() => ({ profiles, setProfiles, pastelPalette }), [profiles, setProfiles]);
}

export function resetProfiles() {
  saveProfilesToStorage(defaultProfiles);
}

