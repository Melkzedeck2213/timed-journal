import { useEffect, useState } from "react";
import NoteForm from "./components/NoteForm";
import NoteList from "./components/NoteList";
import type { Note } from "./types";
import "./App.css"

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);

  // Fetch notes from backend
  useEffect(() => {
    fetch("http://localhost:4000/notes")
      .then((res) => res.json())
      .then((data: Note[]) => setNotes(data))
      .catch((err) => console.error("Failed to fetch notes", err));
  }, []);

  // Add a new note via backend
  async function addNote(text: string, createdAt?: string) {
    try {
      const res = await fetch("http://localhost:4000/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          createdAt ? { text, created_at: createdAt } : { text }
        ),
      });

      const newNote: Note = await res.json();
      setNotes((prev) => [newNote, ...prev]);
    } catch (err) {
      console.error("Failed to add note", err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="w-full max-w-xl bg-white/80 rounded-xl shadow-2xl p-8 backdrop-blur-md">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 drop-shadow">
          Notebook Timer
        </h1>
        <NoteForm onAdd={addNote} />
        <NoteList notes={notes} />
      </div>
    </div>
  );
}
