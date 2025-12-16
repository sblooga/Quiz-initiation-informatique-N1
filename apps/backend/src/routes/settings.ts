import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const r = Router();

// POST /settings/verify-code
// Vérifie si un code est valide (pour le frontend)
r.post('/verify-code', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'code_required' });

    try {
        const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['admin_code']);
        if (!setting) {
            // Fallback
            return res.json({ valid: code === '000000' });
        }

        const valid = await bcrypt.compare(code, setting.value);
        return res.json({ valid });
    } catch (e: any) {
        console.error('Verify code error:', e);
        return res.status(500).json({ error: 'server_error' });
    }
});

// POST /settings/change-code
// Change le code d'administration (nécessite l'ancien code)
r.post('/change-code', async (req, res) => {
    const { oldCode, newCode } = req.body;

    if (!oldCode || !newCode) {
        return res.status(400).json({ error: 'missing_fields', detail: 'Ancien et nouveau code requis.' });
    }

    if (!/^\d{6}$/.test(newCode)) {
        return res.status(400).json({ error: 'invalid_format', detail: 'Le nouveau code doit contenir 6 chiffres.' });
    }

    try {
        // 1. Vérifier l'ancien code
        const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['admin_code']);
        let isValid = false;

        if (setting) {
            isValid = await bcrypt.compare(oldCode, setting.value);
        } else {
            isValid = oldCode === '000000';
        }

        if (!isValid) {
            return res.status(401).json({ error: 'invalid_old_code', detail: 'L\'ancien code est incorrect.' });
        }

        // 2. Hacher et sauvegarder le nouveau code
        const hash = await bcrypt.hash(newCode, 10);

        // Upsert (SQLite supporte REPLACE INTO ou ON CONFLICT, Postgres ON CONFLICT)
        // db.ts run() gère les requêtes simples. Pour la compatibilité, on fait un UPDATE car on sait qu'il existe (ou INSERT si vide)

        let result;
        if (setting) {
            // Utilisation de "key" entre guillemets pour éviter les conflits de mots-clés SQL (surtout Postgres)
            result = await db.run('UPDATE settings SET value = ? WHERE "key" = ?', [hash, 'admin_code']);
        } else {
            result = await db.run('INSERT INTO settings ("key", value) VALUES (?, ?)', ['admin_code', hash]);
        }

        console.log(`🔑 Admin code updated. Changes: ${result.changes}`);

        if (result.changes === 0) {
            console.warn('⚠️ Warning: No rows updated when changing admin code.');
            // On ne renvoie pas forcément une erreur 500 car ça peut être un cas limite, mais c'est suspect.
        }

        return res.json({ success: true });

    } catch (e: any) {
        console.error('Change code error:', e);
        return res.status(500).json({ error: 'server_error', detail: e.message });
    }
});

// GET /settings/debug-db
// Endpoint temporaire pour diagnostiquer la DB
r.get('/debug-db', async (req, res) => {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(`[${new Date().toISOString()}] ${msg}`);

    try {
        log('Starting DB debug...');

        // 1. Check DB type
        const dbType = process.env.DATABASE_URL?.startsWith('postgres') ? 'Postgres' : 'SQLite';
        log(`DB Type: ${dbType}`);

        // 2. Read current settings
        log('Reading settings...');
        const setting = await db.get('SELECT * FROM settings WHERE "key" = ?', ['admin_code']);
        log(`Current setting found: ${!!setting}`);
        if (setting) {
            log(`Current value length: ${setting.value?.length}`);
            log(`Current key: ${setting.key}`);
        }

        // 3. Try a dummy update (same value)
        if (setting) {
            log('Attempting dummy UPDATE...');
            const result = await db.run('UPDATE settings SET value = ? WHERE "key" = ?', [setting.value, 'admin_code']);
            log(`Update result: ${JSON.stringify(result)}`);
        } else {
            log('No setting to update.');
        }

        // 4. Test table info (Postgres only)
        if (dbType === 'Postgres') {
            try {
                const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
                log(`Tables: ${tables.map(t => t.table_name).join(', ')}`);
            } catch (e: any) {
                log(`Error listing tables: ${e.message}`);
            }
        }

        log('Debug complete.');
        return res.json({ logs });
    } catch (e: any) {
        log(`FATAL ERROR: ${e.message}`);
        return res.status(500).json({ logs, error: e.message });
    }
});

export default r;
