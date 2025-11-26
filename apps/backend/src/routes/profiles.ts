import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM profiles').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, photo, color } = req.body;
  try {
    const info = db.prepare('INSERT INTO profiles(name, photo, color) VALUES(?, ?, ?)').run(name, photo || '', color || '');
    res.json({ id: info.lastInsertRowid, name, photo: photo || '', color: color || '' });
  } catch (e) {
    res.status(400).json({ error: 'Impossible d\'ajouter' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM profiles WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Impossible de supprimer' });
  }
});

router.put('/:id', (req, res) => {
  const { name, photo, color } = req.body;
  try {
    db.prepare('UPDATE profiles SET name = ?, photo = ?, color = ? WHERE id = ?').run(name, photo || '', color || '', req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Impossible de modifier' });
  }
});

export default router;
