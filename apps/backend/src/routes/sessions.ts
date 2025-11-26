import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/:profileId', (req, res) => {
  const rows = db.prepare('SELECT * FROM sessions WHERE profileId = ? ORDER BY date DESC').all(req.params.profileId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { profileId, date, score } = req.body;
  const info = db.prepare('INSERT INTO sessions(profileId, date, score) VALUES(?,?,?)').run(profileId, date, score);
  res.json({ id: info.lastInsertRowid });
});

export default router;
