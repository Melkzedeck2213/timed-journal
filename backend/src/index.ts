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
//get all notes
app.get("/notes", async(_req:Request, res:Response) => {
  try{
    const result = await pool.query<Note>("SELECT * FROM notes ORDER BY created_at DESC")
    res.json(result.rows)
  }
  catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({error: "Internal server error"});

  }
})


//create a new note
app.post("/notes", async (req, res) => {
  const { text, created_at } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required" });
  }
  try {
    let result;
    if (created_at) {
      result = await pool.query(
        "INSERT INTO notes (text, created_at) VALUES ($1, $2) RETURNING *",
        [text, created_at]
      );
    } else {
      result = await pool.query(
        "INSERT INTO notes (text) VALUES ($1) RETURNING *",
        [text]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding note:", err);
    res.status(500).json({ error: "Failed to add note" });
  }
})

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



