import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'apps/backend/data.sqlite'));

const rows = db.prepare('SELECT id, label, course_ref, pdf_page FROM questions WHERE course_ref = ?').all('Partie 1 / Sauvegardes');

console.log('Questions "Partie 1 / Sauvegardes" :');
rows.forEach(row => {
    console.log(`ID: ${row.id} | Question: ${row.label} | Page: ${row.pdf_page}`);
});
