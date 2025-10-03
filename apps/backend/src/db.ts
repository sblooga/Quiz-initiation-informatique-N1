import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbFile = process.env.DATABASE_URL || './data.sqlite';
const db = new Database(dbFile);

const schema = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');
db.exec(schema);

export default db;
