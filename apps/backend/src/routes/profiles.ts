import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM profiles').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  try {
    const info = db.prepare('INSERT INTO profiles(name) VALUES(?)').run(name);
    res.json({ id: info.lastInsertRowid, name });
  } catch (e) {
    res.status(400).json({ error: 'Impossible d\'ajouter' });
  }
});

export default router;
