import fs from 'fs';
import path from 'path';

const COURS_TXT_PATH = path.join(process.cwd(), 'apps/frontend/public/cours.txt');
const content = fs.readFileSync(COURS_TXT_PATH, 'latin1');

console.log('--- Début du fichier (latin1) ---');
console.log(content.substring(0, 500));

const regex = /Le.on\s+(\d+).*?\.+(\d+)\s*$/gm;
let match;
console.log('--- Tests Regex ---');
while ((match = regex.exec(content)) !== null) {
    console.log(`Match: Leçon ${match[1]} -> Page ${match[2]}`);
}
