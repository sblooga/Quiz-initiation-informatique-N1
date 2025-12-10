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
// Lecture en latin1 pour gérer les problèmes d'encodage
const coursContent = fs.readFileSync(COURS_TXT_PATH, 'latin1');

// Regex souple pour "Leçon" (Le.on) et gestion des espaces/points
const lessonRegex = /Le.on\s+(\d+).*?\.+(\d+)\s*$/gm;

let match;
let updates = 0;

const updateStmt = db.prepare('UPDATE questions SET pdf_page = ? WHERE course_ref LIKE ?');

console.log('Début de la synchronisation V4 (Latin1)...');

while ((match = lessonRegex.exec(coursContent)) !== null) {
    const lessonNum = match[1];
    const pageNum = parseInt(match[2], 10);
    const courseRefPattern = `Leçon ${lessonNum}%`;

    const info = updateStmt.run(pageNum, courseRefPattern);

    if (info.changes > 0) {
        console.log(`Mise à jour : ${courseRefPattern} -> Page ${pageNum} (${info.changes} questions)`);
        updates += info.changes;
    }
}

console.log(`Synchronisation terminée. ${updates} questions mises à jour.`);
