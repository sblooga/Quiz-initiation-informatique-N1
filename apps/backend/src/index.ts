import express from "express";
import cors from "cors";
import multer from "multer";
import Database from "better-sqlite3";

const app = express();
app.use(cors());
app.use(express.json());

// SQLite local (fichier créé au besoin)
const db = new Database("quiz.db");

// Multer 2.x (stockage disque basique)
const upload = multer({ dest: "uploads/" });

// Santé
app.get("/health", (_req, res) => {
  res.json({ ok: 1, node: process.version });
});

// Version SQLite
app.get("/version-sqlite", (_req, res) => {
  const row = db.prepare("select sqlite_version() as v").get();
  res.json({ sqlite_version: row.v });
});

// Upload simple (champ form-data "file")
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: 0, error: "No file" });
  res.json({
    ok: 1,
    file: {
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
