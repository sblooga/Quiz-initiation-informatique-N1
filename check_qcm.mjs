import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'apps/backend/data.sqlite');

console.log(`Checking DB at: ${dbPath}`);
const db = new Database(dbPath);

try {
    const questions = db.prepare("SELECT id, type, label, choices_json FROM questions WHERE type = 'QCM' LIMIT 5").all();
    console.log(JSON.stringify(questions, null, 2));
} catch (e) {
    console.error(e);
}
