// apps/backend/src/injectData.ts

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// --- Configuration DB ---
const DB_PATH = process.env.DATABASE_URL || './apps/backend/app/data/app.sqlite';
const ABS_DB_PATH = resolve(DB_PATH);
mkdirSync(dirname(ABS_DB_PATH), { recursive: true });
console.log('[SQLite Injector] DB file =', ABS_DB_PATH);

async function runInjection() {
    let db;
    try {
        db = await open({ filename: ABS_DB_PATH, driver: sqlite3.Database });
        await db.exec(`PRAGMA journal_mode = WAL;`);

        // --- Instructions SQL ---
        const sql = `
            DROP TABLE IF EXISTS questions;

            CREATE TABLE questions (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id    INTEGER,
                type           TEXT NOT NULL,
                label          TEXT NOT NULL,
                choices_json   TEXT,
                answer_text    TEXT,
                answer_index   INTEGER,
                theme          TEXT,
                course_ref     TEXT,
                pdf_keyword    TEXT,
                pdf_page       INTEGER,
                created_at     TEXT DEFAULT (datetime('now'))
            );

            INSERT INTO questions (question_id, type, label, choices_json, answer_text, answer_index) VALUES
            (1, 'QCM', 'Quelle est la couleur du cheval blanc d''Henri IV ?', '["Rouge","Blanc","Vert"]', 'Blanc', 1),
            (2, 'VraiFaux', 'Le frontend est écrit en React.', '["Vrai","Faux"]', 'Vrai', 0),
            (3, 'Compléter', 'Le gestionnaire de paquets de Node est ____.', '[]', 'npm', NULL);
        `;

        await db.exec(sql.trim());

        console.log('✅ 3 questions de test injectées avec succès.');

    } catch (e) {
        console.error('❌ ÉCHEC de l\'injection de données:', e);
    } finally {
        try { await db?.close(); } catch {}
    }
}

runInjection();
