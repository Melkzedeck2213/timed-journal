import { useState } from "react";

interface NoteFormProps {
  onAdd: (text: string, createdAt?: string) => void;
}

export default function NoteForm({ onAdd }: NoteFormProps) {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), time ? new Date(time).toISOString() : undefined);
    setText("");
    setTime("");
  }

  function setNow() {
    const now = new Date();
    // Format as yyyy-MM-ddTHH:mm for input[type="datetime-local"]
    const local = now.toISOString().slice(0, 16);
    setTime(local);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your note here..."
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center gap-2">
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <button
          type="button"
          onClick={setNow}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Now
        </button>
      </div>
      <button
        type="submit"
        className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Add Note
      </button>
    </form>
  );
}
