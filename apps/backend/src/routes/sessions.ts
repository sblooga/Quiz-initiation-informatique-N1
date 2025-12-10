import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/sessions - Get all sessions
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM sessions ORDER BY date DESC').all();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:profileId - Get sessions for a specific profile
router.get('/:profileId', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM sessions WHERE profileId = ? ORDER BY date DESC').all(req.params.profileId);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/sessions - Create a new session
router.post('/', (req, res) => {
  try {
    const { profileId, date, score } = req.body;

    if (!profileId || !date || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields: profileId, date, score' });
    }

    const info = db.prepare('INSERT INTO sessions(profileId, date, score) VALUES(?,?,?)').run(profileId, date, score);
    res.json({ id: info.lastInsertRowid, profileId, date, score });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

export default router;
