import express from 'express';
import cors from 'cors';
import path from 'path';
import questions from './routes/questions';
import profiles from './routes/profiles';
import sessions from './routes/sessions';

const app = express();
app.use(cors());
app.use(express.json());

const pdfPath = process.env.PDF_PATH || path.join(process.cwd(), 'apps/frontend/public/cours.pdf');
app.use('/pdf', express.static(pdfPath));

app.use('/questions', questions);
app.use('/profiles', profiles);
app.use('/sessions', sessions);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server listening on', port));
