import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface unifiée pour la base de données
export interface IDatabase {
    query(sql: string, params?: any[]): Promise<any[]>;
    run(sql: string, params?: any[]): Promise<{ id?: number | string, changes?: number }>;
    get(sql: string, params?: any[]): Promise<any>;
}

let db: IDatabase;

const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

// Code par défaut (000000) haché
const DEFAULT_CODE = '000000';

const initSettings = async (database: IDatabase) => {
    try {
        const row = await database.get('SELECT value FROM settings WHERE key = ?', ['admin_code']);
        if (!row) {
            console.log('🔒 Initializing default admin code...');
            const hash = await bcrypt.hash(DEFAULT_CODE, 10);
            await database.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['admin_code', hash]);
            console.log('✅ Default admin code set to 000000');
        }
    } catch (err) {
        console.error('❌ Error initializing settings:', err);
    }
};

if (isPostgres) {
    console.log('🔌 Connecting to PostgreSQL...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Nécessaire pour Render
        }
    });

    // Helper pour convertir les ? de SQLite en $1, $2... de Postgres
    const convertSql = (sql: string) => {
        let i = 1;
        return sql.replace(/\?/g, () => `$${i++}`);
    };

    db = {
        query: async (sql, params = []) => {
            const res = await pool.query(convertSql(sql), params);
            return res.rows;
        },
        run: async (sql, params = []) => {
            let finalSql = convertSql(sql);
            // Si c'est un INSERT et qu'il n'y a pas déjà de RETURNING, on l'ajoute
            if (/^\s*INSERT\s+/i.test(finalSql) && !/RETURNING\s+/i.test(finalSql)) {
                finalSql += ' RETURNING id';
            }

            console.log('⚡ Executing SQL:', finalSql, params);
            try {
                const res = await pool.query(finalSql, params);

                // Si on a un retour avec id (cas du INSERT RETURNING id)
                if (res.rows.length > 0 && res.rows[0].id) {
                    return { id: res.rows[0].id, changes: res.rowCount ?? 0 };
                }
                return { changes: res.rowCount ?? 0 };
            } catch (err) {
                console.error('❌ SQL Error:', err);
                throw err;
            }
        },
        get: async (sql, params = []) => {
            const res = await pool.query(convertSql(sql), params);
            return res.rows[0];
        }
    };

    // Initialisation du schéma Postgres
    const initPostgres = async () => {
        try {
            // Création des tables adaptée pour Postgres
            await pool.query(`
                CREATE TABLE IF NOT EXISTS profiles (
                    id SERIAL PRIMARY KEY,
                    name TEXT UNIQUE,
                    photo TEXT,
                    color TEXT
                );
            `);
            await pool.query(`
                CREATE TABLE IF NOT EXISTS sessions (
                    id SERIAL PRIMARY KEY,
                    "profileId" INTEGER NOT NULL,
                    date BIGINT NOT NULL,
                    score INTEGER NOT NULL,
                    answers JSONB,
                    FOREIGN KEY("profileId") REFERENCES profiles(id) ON DELETE CASCADE
                );
            `);
            await pool.query(`
                CREATE TABLE IF NOT EXISTS questions (
                    id SERIAL PRIMARY KEY,
                    question_id INTEGER,
                    type TEXT NOT NULL,
                    label TEXT NOT NULL,
                    choices_json TEXT,
                    answer_text TEXT,
                    answer_index INTEGER,
                    theme TEXT,
                    course_ref TEXT,
                    pdf_keyword TEXT,
                    lesson TEXT,
                    pdf_page INTEGER,
                    pdf_search_text TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            await pool.query(`
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
            `);
            console.log('✅ PostgreSQL Schema initialized');
            await initSettings(db);
        } catch (err) {
            console.error('❌ Error initializing PostgreSQL schema:', err);
        }
    };
    initPostgres();

} else {
    console.log('🔌 Connecting to SQLite (Local)...');
    const dbFile = process.env.DATABASE_URL || './data.sqlite';
    const sqlite = new Database(dbFile);

    // Initialisation du schéma SQLite
    const schema = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');
    sqlite.exec(schema);

    // Migration : Vérifier si la colonne 'answers' existe dans la table sessions
    try {
        const tableInfo = sqlite.prepare("PRAGMA table_info(sessions)").all() as any[];
        const hasAnswersColumn = tableInfo.some((col: any) => col.name === 'answers');

        if (!hasAnswersColumn) {
            console.log('⚠️  Migration: Ajout de la colonne "answers" à la table sessions');
            sqlite.exec('ALTER TABLE sessions ADD COLUMN answers TEXT');
            console.log('✅ Migration réussie');
        }
    } catch (err) {
        console.error('❌ Erreur lors de la migration:', err);
    }

    db = {
        query: async (sql, params = []) => {
            return sqlite.prepare(sql).all(params);
        },
        run: async (sql, params = []) => {
            const info = sqlite.prepare(sql).run(params);
            return { id: Number(info.lastInsertRowid), changes: info.changes };
        },
        get: async (sql, params = []) => {
            return sqlite.prepare(sql).get(params);
        }
    };

    // Init settings for SQLite
    initSettings(db);
}

export default db;
