import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

const router = Router();
const upload = multer();
const questionsFile = path.join(process.cwd(), 'questions.json');

router.get('/', (req, res) => {
  if (fs.existsSync(questionsFile)) {
    res.json(JSON.parse(fs.readFileSync(questionsFile, 'utf8')));
  } else {
    res.json([]);
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  const csv = req.file?.buffer.toString('utf8') || '';
  const delimiter = csv.includes(';') && !csv.includes(',') ? ';' : ',';
  const rows = parse(csv, { columns: true, delimiter, skip_empty_lines: true });
  fs.writeFileSync(questionsFile, JSON.stringify(rows, null, 2));
  res.json({ imported: rows.length });
});

export default router;
