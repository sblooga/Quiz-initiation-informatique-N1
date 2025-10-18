import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


const {
  NOCODB_BASE_URL,
  NOCODB_QUESTIONS_TABLE_ID,
  NOCODB_AUTH_TOKEN,
  PORT = 3001,
} = process.env;

app.get("/health", (_, res) => res.status(200).send("OK"));

app.get("/questions", async (_req, res) => {
  try {
    const url = `${NOCODB_BASE_URL}/${NOCODB_QUESTIONS_TABLE_ID}/records`;
    const response = await axios.get(url, {
      headers: { "xc-token": NOCODB_AUTH_TOKEN },
    });
    res.json(response.data.list);
  } catch (error) {
    console.error("Error fetching questions from NocoDB:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

app.post("/questions/import", async (req, res) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || !questions.length) {
    return res.status(400).json({ error: "questions[] required" });
  }

  try {
    const url = `${NOCODB_BASE_URL}/${NOCODB_QUESTIONS_TABLE_ID}/records`;
    const headers = { "xc-token": NOCODB_AUTH_TOKEN };

    // 1. Fetch all existing records to get their IDs
    const getResponse = await axios.get(url, { headers });
    const existingIds = getResponse.data.list.map((q: any) => q.Id);

    // 2. Delete all existing records
    if (existingIds.length > 0) {
      await axios.delete(url, {
        headers,
        data: { ids: existingIds },
      });
    }

    // 3. Insert new records
    console.log(`Inserting ${questions.length} new questions.`);
    await axios.post(url, questions, { headers });

    res.status(201).json({ inserted: questions.length });
  } catch (e: any) {
    console.error('import error', e?.message || e);
    return res.status(500).json({ error: 'import_failed', detail: e?.message || String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
