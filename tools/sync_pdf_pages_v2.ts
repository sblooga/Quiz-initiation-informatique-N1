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

// Regex pour extraire "Leçon XXX ... Page Y"
// Ex: Leçon 044 présentation du mode accessibilité....................................................................................................72
const lessonRegex = /Leçon\s+(\d+).*?\.+(\d+)$/gm;

let match;
let updates = 0;

const updateStmt = db.prepare('UPDATE questions SET pdf_page = ? WHERE course_ref LIKE ?');

console.log('Début de la synchronisation...');

while ((match = lessonRegex.exec(coursContent)) !== null) {
    const lessonNum = match[1]; // "044"
    const pageNum = parseInt(match[2], 10); // 72
    const courseRef = `Leçon ${lessonNum}%`;

    const info = updateStmt.run(pageNum, courseRef);
    if (info.changes > 0) {
        console.log(`Mise à jour : ${courseRef} -> Page ${pageNum} (${info.changes} questions)`);
        updates += info.changes;
    }
}

console.log(`Synchronisation terminée. ${updates} questions mises à jour.`);
