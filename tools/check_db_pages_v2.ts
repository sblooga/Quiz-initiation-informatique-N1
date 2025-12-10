import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'apps/backend/data.sqlite'));

const lessons = ['Leçon 001', 'Leçon 004', 'Leçon 044'];

lessons.forEach(lesson => {
    const rows = db.prepare('SELECT course_ref, pdf_page FROM questions WHERE course_ref LIKE ?').all(`${lesson}%`);
    console.log(`--- ${lesson} ---`);
    if (rows.length === 0) {
        console.log('Aucune question trouvée.');
    } else {
        rows.forEach(row => {
            console.log(`${row.course_ref}: Page ${row.pdf_page}`);
        });
    }
});
