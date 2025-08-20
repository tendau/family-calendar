import { useState } from "react";
import { useAtom } from "jotai";
import { eventsAtom, type Event } from "../atoms/eventAtom";
import { createEvent } from "../api/events";

export const AddEventForm: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [, setEvents] = useAtom(eventsAtom);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    setLoading(true);
    setError(null);

    try {
      const newEvent = await createEvent({ title, date });
      setEvents((prev) => [...prev, newEvent]);
      setTitle("");
      setDate("");
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to add event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2 border rounded">
      <input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-1 border rounded"
        disabled={loading}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="p-1 border rounded"
        disabled={loading}
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
        {loading ? "Adding..." : "Add Event"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};
