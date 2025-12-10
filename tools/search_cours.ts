import fs from 'fs';
import path from 'path';

const COURS_TXT_PATH = path.join(process.cwd(), 'apps/frontend/public/cours.txt');
const content = fs.readFileSync(COURS_TXT_PATH, 'latin1');

const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.toLowerCase().includes('patriot')) {
        console.log(`Ligne ${index + 1}: ${line.trim()}`);
    }
});
