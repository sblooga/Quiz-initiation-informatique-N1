import { openDB } from 'idb';
import { Question } from './types';

const DB_NAME = 'quiz-n1';
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('questions');
      const profile = db.createObjectStore('profiles', { keyPath: 'name' });
      profile.createIndex('name', 'name', { unique: true });
      db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
    }
  });
}

export async function saveQuestions(questions: Question[]) {
  const db = await getDB();
  await db.put('questions', questions, 'all');
}

export async function loadQuestions(): Promise<Question[]> {
  const db = await getDB();
  return (await db.get('questions', 'all')) || [];
}

export interface SessionItem {
  profile: string;
  date: number;
  score: number;
}

export async function saveSession(session: SessionItem) {
  const db = await getDB();
  await db.add('sessions', session);
}

export async function getSessions(profile: string): Promise<SessionItem[]> {
  const db = await getDB();
  const all = await db.getAll('sessions');
  return all.filter((s: SessionItem) => s.profile === profile);
}

export async function getAllSessions(): Promise<SessionItem[]> {
  const db = await getDB();
  return db.getAll('sessions');
}
