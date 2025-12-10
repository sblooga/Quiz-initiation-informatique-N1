import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'apps/backend/data.sqlite'));

const schema = db.prepare("PRAGMA table_info(questions)").all();
console.log(schema);
