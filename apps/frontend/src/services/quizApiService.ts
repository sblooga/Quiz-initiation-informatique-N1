import axios from 'axios';

const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

export interface Student {
    id: number;
    name: string;
    photo: string;
    color: string;
}

export interface Question {
    id: number;
    type: 'QCM' | 'VraiFaux' | 'Compléter';
    label: string;
    choices: string[];
    answer: {
        text: string | null;
        index: number | null;
    };
    meta: {
        questionId: number | null;
        theme: string | null;
        courseRef: string | null;
        pdfKeyword: string | null;
        lesson: string | null;
        pdfPage: number | null;
        pdfSearchText: string | null;
    };
}

export interface Session {
    id: number;
    profileId: number;
    date: number;
    score: number;
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchStudents = async (): Promise<Student[]> => {
    try {
        const response = await api.get('/api/students');
        return response.data;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

export const createStudent = async (name: string, photo: string, color: string): Promise<Student> => {
    try {
        const response = await api.post('/api/students', { name, photo, color });
        return response.data;
    } catch (error) {
        console.error('Error creating student:', error);
        throw error;
    }
};

export const deleteStudent = async (id: number): Promise<void> => {
    try {
        await api.delete(`/api/students/${id}`);
    } catch (error) {
        console.error('Error deleting student:', error);
        throw error;
    }
};

export const updateStudent = async (id: number, name: string, photo: string, color: string): Promise<void> => {
    try {
        await api.put(`/api/students/${id}`, { name, photo, color });
    } catch (error) {
        console.error('Error updating student:', error);
        throw error;
    }
};

export const fetchQuestions = async (): Promise<Question[]> => {
    try {
        const response = await api.get('/api/questions');
        return response.data;
    } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
    }
};

export const fetchSessions = async (): Promise<Session[]> => {
    try {
        const response = await api.get('/api/sessions');
        return response.data;
    } catch (error) {
        console.error('Error fetching sessions:', error);
        throw error;
    }
};

export const saveSession = async (profileId: number, date: number, score: number): Promise<Session> => {
    try {
        const response = await api.post('/api/sessions', { profileId, date, score });
        return response.data;
    } catch (error) {
        console.error('Error saving session:', error);
        throw error;
    }
};

export default {
    fetchStudents,
    createStudent,
    deleteStudent,
    updateStudent,
    fetchQuestions,
    fetchSessions,
    saveSession,
};
