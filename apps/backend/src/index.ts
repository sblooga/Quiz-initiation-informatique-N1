import cors from 'cors';
import 'dotenv/config';
import express, { Request } from 'express';
// ⚠️ CORRECTION: Retrait de l'extension .js
import questionsRouter from './routes/questions.js';

const app = express();

// --- Middleware CORS ---
app.use(cors({
    origin: [
        'http://localhost:5173', 'http://127.0.0.1:5173',
        'http://localhost:5174', 'http://127.0.0.1:5174',

        // Ports de développement ciblés
        'http://localhost:3000', 'http://127.0.0.1:3000',
        'http://localhost:3001', 'http://127.0.0.1:3001',
        'http://localhost:3002', 'http://127.0.0.1:3002',
    ],
}));

// --- Middleware JSON ---
app.use(express.json({ limit: '10mb' }));

// --- Middleware de Logging Général (Optionnel mais propre) ---
app.use((req: Request, _res, next) => {
    if (req.method === 'POST') {
        console.log(`[REQ] ${req.method} ${req.url} ct=${req.headers['content-type']}`);
    }
    next();
});

// --- Routes ---
app.get('/health', (_req, res) => res.send('OK'));

import profilesRouter from './routes/profiles.js';
import sessionsRouter from './routes/sessions.js';

const apiRouter = express.Router();
apiRouter.use('/questions', questionsRouter);
apiRouter.use('/students', profilesRouter);
apiRouter.use('/sessions', sessionsRouter);

app.use('/api', apiRouter);

// --- Démarrage du Serveur ---
const port = Number(process.env.PORT ?? 5000);
app.listen(port, () => {
    console.log(`API OK → http://localhost:${port}`);
});

// --- Gestion des Erreurs Globales ---
process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));
process.on('uncaughtException', (e) => console.error('[uncaughtException]', e));

// --- Servir le Frontend (Production) ---
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Le dossier dist du frontend est au niveau de apps/frontend/dist
// Depuis apps/backend/dist/index.js, c'est ../../frontend/dist
const frontendDist = path.join(__dirname, '../../frontend/dist');

app.use(express.static(frontendDist));

// Pour toutes les autres routes (SPA), renvoyer index.html
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendDist, 'index.html'));
    }
});
