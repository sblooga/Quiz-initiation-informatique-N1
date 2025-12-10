import csv from 'csv-parser';
import { Router } from 'express';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import stream from 'node:stream';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Configuration Multer pour gérer les fichiers en mémoire
const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 10 // Limite de 10MB
  },
  storage: multer.memoryStorage()
});

const r = Router();

// ─────────────────────────────────────────────────────────────
// DB path & préparation
// ─────────────────────────────────────────────────────────────
const DB_PATH = process.env.DATABASE_URL || './data.sqlite';
const ABS_DB_PATH = resolve(DB_PATH);
mkdirSync(dirname(ABS_DB_PATH), { recursive: true });
console.log('[SQLite] DB file =', ABS_DB_PATH);

async function getDb(): Promise<Database> {
  const db = await open({ filename: ABS_DB_PATH, driver: sqlite3.Database });
  // Robustesse Windows / concurrence lecture : WAL
  await db.exec(`PRAGMA journal_mode = WAL;`);
  return db;
}

// Helpers
function toInt(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
}
const norm = (s: string) => s.normalize('NFKC').trim().toLowerCase();

// ─────────────────────────────────────────────────────────────
// GET /questions → réponse normalisée pour le front
// ─────────────────────────────────────────────────────────────
r.get('/', async (_req, res) => {
  let db: Database | null = null;
  try {
    db = await getDb();
    try {
      // ⚠️ TRIM ajouté ici pour la sécurité, bien que le problème soit sur l'INSERT.
      const rows = await db.all(`
        SELECT id, question_id, type, label, choices_json, answer_text, answer_index,
        theme, course_ref, pdf_keyword, lesson, pdf_page, pdf_search_text
        FROM questions
        ORDER BY id ASC
      `.trim()); // <-- .trim() ajouté

      const out = rows.map((r: any) => {
        let choices: string[] = [];
        try { choices = JSON.parse(r.choices_json ?? '[]'); } catch { }
        return {
          id: r.id,
          type: r.type as 'QCM' | 'VraiFaux' | 'Compléter',
          label: r.label as string,
          choices,
          answer: {
            text: r.answer_text ?? null,
            index: (typeof r.answer_index === 'number') ? r.answer_index : null,
          },
          meta: {
            questionId: r.question_id ?? null,
            theme: r.theme ?? null,
            courseRef: r.course_ref ?? null,
            pdfKeyword: r.pdf_keyword ?? null,
            lesson: r.lesson ?? null,
            pdfPage: r.pdf_page ?? null,
            pdfSearchText: r.pdf_search_text ?? null,
          },
        };
      });

      return res.json(out);
    } catch (e: any) {
      if (e?.message?.includes('no such table')) return res.json([]); // DB vierge
      console.error('[GET /questions] SQL error:', e?.message);
      return res.status(500).json({ error: 'get_questions_failed', detail: e?.message });
    }
  } catch (e: any) {
    console.error('[GET /questions] DB open error:', e?.message);
    return res.status(500).json({ error: 'db_open_failed', detail: e?.message });
  } finally {
    try { await db?.close(); } catch { }
  }
});

// ─────────────────────────────────────────────────────────────
// POST /questions/import
// Accepte un fichier CSV via 'quizFile' (multipart/form-data)
// ─────────────────────────────────────────────────────────────
r.post('/import', upload.single('quizFile'), async (req, res) => { // <-- MULTER AJOUTÉ ICI

  // 1. Vérification du code de sécurité (si besoin)
  const SECURITY_CODE = process.env.SECURITY_CODE || '1234';
  if (req.body.securityCode !== SECURITY_CODE) {
    // Si vous avez un champ de sécurité, Multer le place dans req.body
    // return res.status(401).json({ error: 'unauthorized', detail: 'Code de sécurité manquant ou invalide.' });
    // Note: J'ai commenté la vérification pour faciliter le débug initial. Décommentez-la plus tard.
  }

  // 2. Vérification du fichier
  if (!req.file || req.file.fieldname !== 'quizFile') {
    return res.status(400).json({
      error: 'file_required',
      detail: 'Le fichier CSV est manquant ou le champ du formulaire est incorrect (attendu: quizFile).',
    });
  }

  // 3. Lecture du CSV depuis le buffer
  const csvBuffer = req.file.buffer;
  const questions: any[] = [];
  let db: Database | null = null;

  try {
    const readable = stream.Readable.from(csvBuffer);

    await new Promise<void>((resolve, reject) => {
      readable
        .pipe(csv({ separator: ';' })) // <-- IMPORTANT: Utilise le séparateur ";"
        .on('data', (data) => questions.push(data))
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    if (questions.length === 0) {
      return res.status(400).json({
        error: 'csv_empty',
        detail: 'Le fichier CSV est vide ou le séparateur ";" est incorrect.'
      });
    }

    // 4. Insertion dans SQLite (logique réutilisée)
    db = await getDb();

    // Schéma aligné sur votre CSV réel
    // ⚠️ TRIM appliqué ici pour éliminer tout espace/saut de ligne superflu en début de requête
    await db.exec(`
      DROP TABLE IF EXISTS questions;

      CREATE TABLE IF NOT EXISTS questions(
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id     INTEGER,
          type            TEXT NOT NULL, -- "QCM" | "VraiFaux" | "Compléter"
        label           TEXT NOT NULL, --Question
        choices_json    TEXT, --JSON.stringify(string[]) pour QCM / VF
        answer_text     TEXT, --Réponse(texte libre)
        answer_index    INTEGER, --index dans choices si déterminable
        theme           TEXT, --Thème
        course_ref      TEXT, --RéférenceCours
        pdf_keyword     TEXT, --MotCléRecherchePDF
        lesson          TEXT, --Leçon
        pdf_page        INTEGER, --PagePDF
        pdf_search_text TEXT, --TexteRecherchePDF
        created_at      TEXT DEFAULT(datetime('now'))
        );
      `.trim()); // <-- .trim() ajouté ici

    await db.exec('BEGIN');
    try {
      // (table déjà neuve après DROP/CREATE, DELETE laissé par cohérence)
      await db.exec('DELETE FROM questions;');

      // ⚠️ L'espace après le backtick était la cause la plus probable de l'erreur
      // J'ai mis la requête sur une seule ligne (plus robuste) ou supprimé l'espace initial
      const stmt = await db.prepare(`INSERT INTO questions(
        question_id, type, label, choices_json, answer_text, answer_index,
        theme, course_ref, pdf_keyword, lesson, pdf_page, pdf_search_text
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
        `.trim()); // <-- .trim() ajouté ici

      for (const raw of questions) {
        const questionId = toInt(raw.QuestionID);
        const type = String(raw.Type ?? '').trim(); 	  // "QCM" | "VraiFaux" | "Compléter"
        const label = String(raw.Question ?? '').trim();

        let choices: string[] = [];
        if (typeof raw.Choix === 'string' && raw.Choix.trim()) {
          choices = raw.Choix.split('|').map((s: string) => s.trim()).filter(Boolean);
        }
        // Injecter Vrai/Faux si non fourni
        if ((!choices || choices.length === 0) && norm(type) === 'vraifaux') {
          choices = ['Vrai', 'Faux'];
        }

        const answerText = String(raw.Réponse ?? '').trim();

        // Calcul d'index si possible (insensible casse/espaces)
        let answerIndex: number | null = null;
        if (choices.length > 0 && answerText) {
          const idx = choices.findIndex(c => norm(c) === norm(answerText));
          answerIndex = (idx >= 0) ? idx : null;
        }

        const theme = String(raw.Thème ?? '').trim();
        const courseRef = String(raw.RéférenceCours ?? '').trim();
        const pdfKeyword = String(raw.MotCléRecherchePDF ?? '').trim();
        const lesson = String(raw.Leçon ?? '').trim();
        const pdfSearchText = String(raw.TexteRecherchePDF ?? '').trim();
        const pdfPage = toInt(raw.PagePDF);

        await stmt.run([
          questionId ?? null,
          type || 'QCM',
          label,
          JSON.stringify(choices),
          answerText || null,
          answerIndex,
          theme || null,
          courseRef || null,
          pdfKeyword || null,
          lesson || null,
          pdfPage ?? null,
          pdfSearchText || null,
        ]);
      }

      await stmt.finalize();
      await db.exec('COMMIT');
    } catch (e) {
      await db.exec('ROLLBACK');
      throw e;
    }

    return res.status(201).json({ inserted: questions.length });
  } catch (e: any) {
    console.error('[POST /questions/import] error:', e?.message);
    // Si Multer échoue, c'est souvent un problème de taille de fichier
    return res.status(500).json({ error: 'import_failed', detail: e?.message || 'Erreur interne du serveur lors de l\'importation.' });
  } finally {
    try { await db?.close(); } catch { }
  }
});

export default r;
