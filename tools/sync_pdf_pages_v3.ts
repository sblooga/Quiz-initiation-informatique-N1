import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), 'apps/backend/data.sqlite');
const COURS_TXT_PATH = path.join(process.cwd(), 'apps/frontend/public/cours.txt');

if (!fs.existsSync(DB_PATH)) {
    console.error(`Base de données introuvable : ${DB_PATH}`);
    process.exit(1);
}

if (!fs.existsSync(COURS_TXT_PATH)) {
    console.error(`Fichier cours.txt introuvable : ${COURS_TXT_PATH}`);
    process.exit(1);
}

const db = new Database(DB_PATH);
const coursContent = fs.readFileSync(COURS_TXT_PATH, 'utf-8');

const lessonRegex = /Leçon\s+(\d+).*?\.+(\d+)$/gm;

let match;
let updates = 0;

const updateStmt = db.prepare('UPDATE questions SET pdf_page = ? WHERE course_ref LIKE ?');
const checkStmt = db.prepare('SELECT course_ref, pdf_page FROM questions WHERE course_ref LIKE ?');

console.log('Début de la synchronisation V3...');

while ((match = lessonRegex.exec(coursContent)) !== null) {
    const lessonNum = match[1]; // "001"
    const pageNum = parseInt(match[2], 10); // 8
    const courseRefPattern = `Leçon ${lessonNum}%`;

    if (lessonNum === '001') {
        console.log(`Traitement Leçon ${lessonNum} -> Page ${pageNum}`);
        const rows = checkStmt.all(courseRefPattern);
        console.log('Avant update:', rows);
    }

    const info = updateStmt.run(pageNum, courseRefPattern);

    if (lessonNum === '001') {
        console.log(`Update info:`, info);
    }

    if (info.changes > 0) {
        console.log(`Mise à jour : ${courseRefPattern} -> Page ${pageNum} (${info.changes} questions)`);
        updates += info.changes;
    }
}

console.log(`Synchronisation terminée. ${updates} questions mises à jour.`);
