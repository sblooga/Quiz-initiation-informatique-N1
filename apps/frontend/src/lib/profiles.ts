import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchStudents, createStudent, deleteStudent, updateStudent, Student } from '../services/quizApiService';

export interface Profile {
  id: string;
  name: string;
  photo: string;
  color: string;
}

export interface Student {
  id: number;
  name: string;
  photo: string;
  color: string;
}

const pastelPalette = ['#374151', '#4b5563', '#6b7280', '#1f2937', '#111827', '#0f172a'];

function withDefaults(student: Student, index: number): Profile {
  return {
    id: String(student.id),
    name: student.name,
    photo: student.photo || '',
    color: student.color || pastelPalette[index % pastelPalette.length]
  };
}

export function useProfiles() {
  const [profiles, setProfilesState] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const students = await fetchStudents();
      setProfilesState(students.map((s, i) => withDefaults(s, i)));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch profiles', err);
      setError('Impossible de charger les profils.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const addProfile = useCallback(async (name: string, photo: string, color: string) => {
    try {
      await createStudent(name, photo, color);
      await refreshProfiles();
    } catch (err) {
      console.error('Failed to create profile', err);
      throw err;
    }
  }, [refreshProfiles]);

  const updateProfile = useCallback(async (id: string, name: string, photo: string, color: string) => {
    try {
      await updateStudent(Number(id), name, photo, color);
      await refreshProfiles();
    } catch (err) {
      console.error('Failed to update profile', err);
      throw err;
    }
  }, [refreshProfiles]);

  const removeProfile = useCallback(async (id: string) => {
    try {
      await deleteStudent(Number(id));
      await refreshProfiles();
    } catch (err) {
      console.error('Failed to delete profile', err);
      throw err;
    }
  }, [refreshProfiles]);

  return useMemo(() => ({
    profiles,
    loading,
    error,
    addProfile,
    updateProfile,
    removeProfile,
    pastelPalette
  }), [profiles, loading, error, addProfile, updateProfile, removeProfile]);
}
