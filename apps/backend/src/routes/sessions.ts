import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/sessions - Get all sessions
router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM sessions ORDER BY date DESC');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/id/:sessionId - Get a specific session by ID
router.get('/id/:sessionId', async (req, res) => {
  try {
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [req.params.sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    // Parse answers JSON if it exists
    if (session.answers) {
      try {
        // Si c'est une chaîne, on la parse
        if (typeof session.answers === 'string') {
          session.answers = JSON.parse(session.answers);
        }
        // Sinon c'est déjà un objet (PostgreSQL peut auto-parser)
      } catch (parseError) {
        console.error('Error parsing answers JSON:', parseError);
        session.answers = [];
      }
    } else {
      session.answers = [];
    }
    res.json(session);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// GET /api/sessions/:profileId - Get sessions for a specific profile
router.get('/:profileId', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM sessions WHERE "profileId" = ? ORDER BY date DESC', [req.params.profileId]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/sessions - Create a new session
router.post('/', async (req, res) => {
  try {
    const { profileId, date, score, answers } = req.body;

    if (!profileId || !date || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields: profileId, date, score' });
    }

    const answersJson = answers ? JSON.stringify(answers) : null;
    const result = await db.run('INSERT INTO sessions("profileId", date, score, answers) VALUES(?,?,?,?)', [profileId, date, score, answersJson]);
    res.json({ id: result.id, profileId, date, score, answers });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

export default router;
