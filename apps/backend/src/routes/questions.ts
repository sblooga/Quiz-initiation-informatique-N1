import csv from 'csv-parser';
import { Router } from 'express';
import multer from 'multer';
import stream from 'node:stream';
import db from '../db.js';
import bcrypt from 'bcryptjs';

// Configuration Multer pour gérer les fichiers en mémoire
const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 10 // Limite de 10MB
  },
  storage: multer.memoryStorage()
});

const r = Router();

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
  try {
    // ⚠️ TRIM ajouté ici pour la sécurité
    const rows = await db.query(`
      SELECT id, question_id, type, label, choices_json, answer_text, answer_index,
      theme, course_ref, pdf_keyword, lesson, pdf_page, pdf_search_text
      FROM questions
      ORDER BY id ASC
    `.trim());

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
    if (e?.message?.includes('no such table') || e?.message?.includes('does not exist')) return res.json([]); // DB vierge
    console.error('[GET /questions] SQL error:', e?.message);
    return res.status(500).json({ error: 'get_questions_failed', detail: e?.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /questions/import
// Accepte un fichier CSV via 'quizFile' (multipart/form-data)
// ─────────────────────────────────────────────────────────────
r.post('/import', upload.single('quizFile'), async (req, res) => {


  // ... (imports)

  // ... (inside route)
  // 1. Vérification du code de sécurité
  const providedCode = req.body.securityCode || '';

  // Récupérer le hash depuis la BDD
  const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['admin_code']);

  let isValid = false;
  if (setting && setting.value) {
    isValid = await bcrypt.compare(providedCode, setting.value);
  } else {
    // Fallback si pas de settings (ne devrait pas arriver avec le nouveau init)
    // On accepte le code par défaut 000000 ou l'ancien code env pour la transition
    const legacyCode = process.env.SECURITY_CODE || '000000';
    isValid = providedCode === legacyCode;
  }

  if (!isValid) {
    return res.status(401).json({ error: 'unauthorized', detail: 'Code de sécurité invalide.' });
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

    // 4. Insertion via db.ts (Postgres ou SQLite)

    // On utilise une transaction manuelle si possible, ou juste des requêtes séquentielles
    // Note: db.ts ne supporte pas explicitement les transactions, on va faire au mieux.
    // Pour Postgres, on peut faire BEGIN / COMMIT via query.

    // Nettoyage de la table
    try {
      await db.run('DELETE FROM questions');
    } catch (e: any) {
      // Ignorer si la table n'existe pas encore (elle devrait être créée par initPostgres ou schema.sql)
      console.warn('DELETE failed (maybe table missing):', e.message);
    }

    // Préparation de la requête d'insertion
    const insertSql = `INSERT INTO questions(
        question_id, type, label, choices_json, answer_text, answer_index,
        theme, course_ref, pdf_keyword, lesson, pdf_page, pdf_search_text
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;

    let insertedCount = 0;

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

      await db.run(insertSql, [
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
      insertedCount++;
    }

    return res.status(201).json({ inserted: insertedCount });
  } catch (e: any) {
    console.error('[POST /questions/import] error:', e?.message);
    return res.status(500).json({ error: 'import_failed', detail: e?.message || 'Erreur interne du serveur lors de l\'importation.' });
  }
});

export default r;
