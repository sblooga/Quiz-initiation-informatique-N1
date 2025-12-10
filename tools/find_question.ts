import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'apps/backend/data.sqlite'));

const searchTerm = '%Patriot%';
const rows = db.prepare('SELECT id, label, course_ref, pdf_page FROM questions WHERE label LIKE ?').all(searchTerm);

console.log('Questions trouvées :');
rows.forEach(row => {
    console.log(`ID: ${row.id}`);
    console.log(`Question: ${row.label}`);
    console.log(`Ref Cours: ${row.course_ref}`);
    console.log(`Page PDF: ${row.pdf_page}`);
    console.log('---');
});
