import { useCallback, useEffect, useMemo, useState } from 'react';

export interface Profile {
  id: string;
  name: string;
  photo: string;
  color: string;
}

const STORAGE_KEY = 'quiz-n1-profiles-v2';

const pastelPalette = [
  '#d9cffc',
  '#ffe4c4',
  '#d1f2ff',
  '#ffe3f3',
  '#fdf3c7',
  '#c9f5e9'
];

const defaultPhotos = [
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1502767089025-6572583495b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
];

export const PROFILE_PHOTO_LIBRARY = [
  ...defaultPhotos,
  'https://images.unsplash.com/photo-1500043208383-7f1a9a3c7483?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1505692952032-9aa7660f2615?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1589330694653-ded6df03f754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
];

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
    photo: profile.photo ?? defaultPhotos[index % defaultPhotos.length],
    color: profile.color ?? pastelPalette[index % pastelPalette.length]
  };
}

const defaultProfiles: Profile[] = [
  { id: randomId(), name: 'Alice', photo: defaultPhotos[0], color: pastelPalette[0] },
  { id: randomId(), name: 'Bernard', photo: defaultPhotos[1], color: pastelPalette[1] },
  { id: randomId(), name: 'Chloé', photo: defaultPhotos[2], color: pastelPalette[2] },
  { id: randomId(), name: 'Daniel', photo: defaultPhotos[3], color: pastelPalette[3] }
];

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
