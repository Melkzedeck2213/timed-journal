import { useEffect, useState } from "react";
import NoteForm from "./components/NoteForm";
import NoteList from "./components/NoteList";
import AuthPage from "./components/AuthPage";
import type { Note } from "./types";
import "./App.css";

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
  }, [token]);

  // Fetch notes from backend
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:4000/notes", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Note[]) => setNotes(data))
      .catch((err) => console.error("Failed to fetch notes", err));
  }, [token]);

  function handleLogout() {
    setToken(null);
    localStorage.removeItem("token");
  }

  // Only render AuthPage after all hooks
  if (!token) {
    return <AuthPage onAuth={setToken} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="w-full max-w-xl bg-white/80 rounded-xl shadow-2xl p-8 backdrop-blur-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-center text-blue-700 drop-shadow">
            Notebook Timer
          </h1>
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        <NoteForm onAdd={addNote} />
        <NoteList notes={notes} />
      </div>
    </div>
  );

  // Add a new note via backend
  async function addNote(text: string, createdAt?: string) {
    try {
      const res = await fetch("http://localhost:4000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
}
