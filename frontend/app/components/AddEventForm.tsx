import { useState } from "react";
import { useAtom } from "jotai";
import { eventsAtom, type Event } from "../atoms/eventAtom";
import { createEvent } from "../api/events";
import styles from "./AddEventForm.module.css";

export const AddEventForm: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [, setEvents] = useAtom(eventsAtom);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(""); // ISO string
  const [endTime, setEndTime] = useState("");     // ISO string
  const [allDay, setAllDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime) return;

    setLoading(true);
    setError(null);

    try {
      const newEvent = await createEvent({
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        all_day: allDay,
      } as Event);
      setEvents((prev) => [...prev, newEvent]);
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setAllDay(false);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to add event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>Add New Event</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Event Title</label>
          <input
            type="text"
            placeholder="Enter event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            placeholder="Enter event description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={styles.input}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={styles.input}
            disabled={loading}
          />
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="all-day"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            disabled={loading}
            className={styles.checkbox}
          />
          <label htmlFor="all-day" className={styles.label}>All Day Event</label>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Adding Event..." : "Add Event"}
        </button>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </form>
    </div>
  );
};
