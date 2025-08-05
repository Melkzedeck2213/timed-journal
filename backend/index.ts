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
    const result = await pool.query<Note>("SELECT * FRFOM notes ORDER BY created_at DESC")
    res.json(result.rows)
  }
  catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({error: "Internal server error"});

  }
})


//create a new note
app.post("/notes", async(req:Request, res:Response) =>{
const {text} = req.body
if(!text || typeof text !== "string"){
  return res.status(400).json({error: "Invalid note text"})
}
try {
  const result = await pool.query<Note>("INSERT INTO notes (text, created_at) VALUES ($1, NOW()) RETURNING *", [text]);
  res.status(201).json(result.rows[0]);

}
catch (error) {
    console.error(error);
    res.status(500).send("Server error");
}
})

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



