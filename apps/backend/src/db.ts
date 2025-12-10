import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface unifiée pour la base de données
export interface IDatabase {
    query(sql: string, params?: any[]): Promise<any[]>;
    run(sql: string, params?: any[]): Promise<{ id?: number | string }>;
    get(sql: string, params?: any[]): Promise<any>;
}

let db: IDatabase;

const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

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
            const res = await pool.query(convertSql(sql), params);
            // Pour les INSERT, on essaiera de retourner l'ID si possible (via RETURNING id dans la requête ou autre)
            // Mais pour l'instant on retourne un objet vide ou l'id si dispo
            if (res.rows.length > 0 && res.rows[0].id) {
                return { id: res.rows[0].id };
            }
            return {};
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
                    FOREIGN KEY("profileId") REFERENCES profiles(id) ON DELETE CASCADE
                );
            `);
            console.log('✅ PostgreSQL Schema initialized');
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

    db = {
        query: async (sql, params = []) => {
            return sqlite.prepare(sql).all(params);
        },
        run: async (sql, params = []) => {
            const info = sqlite.prepare(sql).run(params);
            return { id: Number(info.lastInsertRowid) };
        },
        get: async (sql, params = []) => {
            return sqlite.prepare(sql).get(params);
        }
    };
}

export default db;
