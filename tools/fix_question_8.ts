import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'apps/backend/data.sqlite'));

const info = db.prepare('UPDATE questions SET pdf_page = ? WHERE id = ?').run(9, 8);

console.log(`Mise à jour ID 8 -> Page 9 : ${info.changes} changement(s)`);

const row = db.prepare('SELECT id, label, pdf_page FROM questions WHERE id = ?').get(8);
console.log('Vérification :', row);
