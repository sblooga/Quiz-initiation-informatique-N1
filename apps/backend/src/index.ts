import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const {
  NOCODB_BASE_URL,
  NOCODB_QUESTIONS_TABLE_ID,
  NOCODB_AUTH_TOKEN,
  PORT = 3001,
} = process.env;

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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
