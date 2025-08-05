import { useEffect, useState } from "react";
import type { Note } from "../types";
import { formatTimeAgo } from "../utils/formatTimeAgo";

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ul className="space-y-4">
      {notes.map((note) => {
        const dayName = new Date(note.created_at).toLocaleDateString(
          undefined,
          { weekday: "long" }
        );
        return (
          <li key={note.id} className="p-4 border rounded shadow">
            <div className="font-medium">{note.text}</div>
            <div className="text-sm text-gray-500">
              {formatTimeAgo(note.created_at, now)} ago &middot; 
             
            </div>
          </li>
        );
      })}
    </ul>
  );
}
