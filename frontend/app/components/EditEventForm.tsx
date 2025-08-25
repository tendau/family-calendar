import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { MdClose, MdEvent, MdDateRange } from "react-icons/md";
import { eventsAtom, type Event } from "../atoms/eventAtom";
import { updateEvent } from "../api/events";
import { Toast } from "./Toast";
import { parseServerDate, parseServerDateTime } from "../utils/datetime";
import styles from "./AddEventForm.module.css";

interface EditEventFormProps {
  event: Event;
  onClose?: () => void;
  onUpdate?: (updatedEvent: Event) => void;
}

export const EditEventForm: React.FC<EditEventFormProps> = ({ event, onClose, onUpdate }) => {
  const [events, setEvents] = useAtom(eventsAtom);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || "");
  
  // Parse the initial dates from the event
  const [startDate, setStartDate] = useState(() => {
    try {
      const date = event.all_day ? parseServerDate(event.start_time) : parseServerDateTime(event.start_time);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });
  
  const [endDate, setEndDate] = useState(() => {
    try {
      const date = event.all_day ? parseServerDate(event.end_time) : parseServerDateTime(event.end_time);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });
  
  const [startTime, setStartTime] = useState(() => {
    if (event.all_day) return "09:00";
    try {
      const date = parseServerDateTime(event.start_time);
      return date.toTimeString().slice(0, 5);
    } catch {
      return "09:00";
    }
  });
  
  const [endTime, setEndTime] = useState(() => {
    if (event.all_day) return "10:00";
    try {
      const date = parseServerDateTime(event.end_time);
      return date.toTimeString().slice(0, 5);
    } catch {
      return "10:00";
    }
  });
  
  const [allDay, setAllDay] = useState(event.all_day);
  const [multiDay, setMultiDay] = useState(() => {
    // Check if it's multi-day by comparing dates
    try {
      const start = event.all_day ? parseServerDate(event.start_time) : parseServerDateTime(event.start_time);
      const end = event.all_day ? parseServerDate(event.end_time) : parseServerDateTime(event.end_time);
      return start.toDateString() !== end.toDateString();
    } catch {
      return false;
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setToast({ message: "Event title is required", type: "error" });
      return;
    }

    setLoading(true);

    try {
      let startDateTime: string;
      let endDateTime: string;

      if (allDay) {
        // For all-day events, use date-only format
        startDateTime = startDate;
        if (multiDay) {
          // For multi-day all-day events, end date is exclusive
          const endDateObj = new Date(endDate);
          endDateObj.setDate(endDateObj.getDate() + 1);
          endDateTime = endDateObj.toISOString().split('T')[0];
        } else {
          // Single day all-day event
          const nextDay = new Date(startDate);
          nextDay.setDate(nextDay.getDate() + 1);
          endDateTime = nextDay.toISOString().split('T')[0];
        }
      } else {
        // For timed events, combine date and time
        const startDateTime_obj = new Date(`${startDate}T${startTime}:00`);
        
        let endDateTime_obj: Date;
        if (multiDay) {
          endDateTime_obj = new Date(`${endDate}T${endTime}:00`);
        } else {
          endDateTime_obj = new Date(`${startDate}T${endTime}:00`);
        }

        startDateTime = startDateTime_obj.toISOString();
        endDateTime = endDateTime_obj.toISOString();
      }

      const updatedEvent = await updateEvent(event.id, {
        title,
        description,
        start_time: startDateTime,
        end_time: endDateTime,
        all_day: allDay,
      });

      setToast({ message: "Event updated successfully!", type: "success" });
      
      // Update the events atom
      setEvents((prev) => prev.map(e => e.id === event.id ? updatedEvent : e));
      
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(updatedEvent);
      }
      
      // Close after success
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to update event", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.formHeader}>
          <h3 className={styles.formTitle}>
            <MdEvent className={styles.titleIcon} />
            Edit Event
          </h3>
          <button 
            onClick={handleCancel}
            className={styles.closeBtn}
            aria-label="Close form"
          >
            <MdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Event Title *</label>
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
              placeholder="Enter event description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className={styles.checkboxRow}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="all-day"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                disabled={loading}
                className={styles.checkbox}
              />
              <label htmlFor="all-day" className={styles.checkboxLabel}>All Day Event</label>
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="multi-day"
                checked={multiDay}
                onChange={(e) => setMultiDay(e.target.checked)}
                disabled={loading}
                className={styles.checkbox}
              />
              <label htmlFor="multi-day" className={styles.checkboxLabel}>Multi-day Event</label>
            </div>
          </div>

          <div className={styles.dateTimeSection}>
            <div className={styles.dateTimeGroup}>
              <label className={styles.label}>
                <MdDateRange className={styles.labelIcon} />
                Start {multiDay ? 'Date' : (allDay ? 'Date' : 'Date & Time')}
              </label>
              <div className={styles.dateTimeInputs}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.datePicker}
                  disabled={loading}
                />
                {!allDay && (
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={styles.timePicker}
                    disabled={loading}
                  />
                )}
              </div>
            </div>

            {(multiDay || !allDay) && (
              <div className={styles.dateTimeGroup}>
                <label className={styles.label}>
                  <MdDateRange className={styles.labelIcon} />
                  End {multiDay ? 'Date' : (allDay ? 'Date' : 'Time')}
                </label>
                <div className={styles.dateTimeInputs}>
                  {multiDay && (
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={styles.datePicker}
                      disabled={loading}
                      min={startDate}
                    />
                  )}
                  {!allDay && (
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={styles.timePicker}
                      disabled={loading}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={handleCancel}
              className={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={loading || !title}
            >
              {loading ? "Updating..." : "Update Event"}
            </button>
          </div>
        </form>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};
