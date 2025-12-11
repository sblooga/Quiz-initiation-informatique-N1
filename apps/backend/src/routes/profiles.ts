import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM profiles');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Impossible de récupérer les profils' });
  }
});

router.post('/', async (req, res) => {
  const { name, photo, color } = req.body;
  try {
    const result = await db.run('INSERT INTO profiles(name, photo, color) VALUES(?, ?, ?)', [name, photo || '', color || '']);
    res.json({ id: result.id, name, photo: photo || '', color: color || '' });
  } catch (e) {
    console.error('❌ Error creating profile:', e);
    res.status(400).json({ error: 'Impossible d\'ajouter', details: e instanceof Error ? e.message : String(e) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const profileId = req.params.id;
    // D'abord supprimer les sessions associées (scores)
    await db.run('DELETE FROM sessions WHERE "profileId" = ?', [profileId]);
    // Ensuite supprimer le profil
    await db.run('DELETE FROM profiles WHERE id = ?', [profileId]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Impossible de supprimer' });
  }
});

router.put('/:id', async (req, res) => {
  const { name, photo, color } = req.body;
  try {
    await db.run('UPDATE profiles SET name = ?, photo = ?, color = ? WHERE id = ?', [name, photo || '', color || '', req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Impossible de modifier' });
  }
});

export default router;
