import express, {Request, Response} from "express";
import cors from "cors";
import {Pool} from "pg";

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "melkzedeck2002",
  port: 5432,
})

interface Note {
  id: number;
  text: string;
  created_at: string; // ISO date string
}

// Get all notes
app.get("/notes", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<Note>("SELECT * FROM notes ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});



// Add a note
app.post("/notes", async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Note text is required" });
  try {
    const result = await pool.query<Note>(
      "INSERT INTO notes (text, created_at) VALUES ($1, NOW()) RETURNING *",
      [text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});





