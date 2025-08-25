import { useState } from "react";
import { useAtom } from "jotai";
import DatePicker from "react-datepicker";
import { MdClose, MdEvent, MdDateRange } from "react-icons/md";
import { eventsAtom, type Event } from "../atoms/eventAtom";
import { createEvent } from "../api/events";
import { Toast } from "./Toast";
import styles from "./AddEventForm.module.css";
import "react-datepicker/dist/react-datepicker.css";

interface AddEventFormProps {
  onClose?: () => void;
  initialDate?: Date;
}

export const AddEventForm: React.FC<AddEventFormProps> = ({ onClose, initialDate }) => {
  const [, setEvents] = useAtom(eventsAtom);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(initialDate || new Date());
  const [endDate, setEndDate] = useState(initialDate || new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(() => {
    const defaultEnd = new Date();
    defaultEnd.setHours(defaultEnd.getHours() + 1);
    return defaultEnd;
  });
  const [allDay, setAllDay] = useState(false);
  const [multiDay, setMultiDay] = useState(false);
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
        startDateTime = startDate.toISOString().split('T')[0];
        if (multiDay) {
          // For multi-day all-day events, end date is exclusive
          const exclusiveEndDate = new Date(endDate);
          exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);
          endDateTime = exclusiveEndDate.toISOString().split('T')[0];
        } else {
          // Single day all-day event
          const nextDay = new Date(startDate);
          nextDay.setDate(nextDay.getDate() + 1);
          endDateTime = nextDay.toISOString().split('T')[0];
        }
      } else {
        // For timed events, combine date and time
        const startDateTime_obj = new Date(startDate);
        startDateTime_obj.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
        
        let endDateTime_obj: Date;
        if (multiDay) {
          endDateTime_obj = new Date(endDate);
          endDateTime_obj.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
        } else {
          endDateTime_obj = new Date(startDate);
          endDateTime_obj.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
        }

        startDateTime = startDateTime_obj.toISOString();
        endDateTime = endDateTime_obj.toISOString();
      }

      const newEvent = await createEvent({
        title,
        description,
        start_time: startDateTime,
        end_time: endDateTime,
        all_day: allDay,
      } as Event);

      setToast({ message: "Event created successfully!", type: "success" });
      setEvents((prev) => [...prev, newEvent]);
      
      // Reset form
      setTitle("");
      setDescription("");
      setStartDate(initialDate || new Date());
      setEndDate(initialDate || new Date());
      setStartTime(new Date());
      const defaultEnd = new Date();
      defaultEnd.setHours(defaultEnd.getHours() + 1);
      setEndTime(defaultEnd);
      setAllDay(false);
      setMultiDay(false);
      
      // Close after success
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to create event", type: "error" });
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
            Add New Event
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
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => date && setStartDate(date)}
                  dateFormat="MMM d, yyyy"
                  className={styles.datePicker}
                  disabled={loading}
                />
                {!allDay && (
                  <DatePicker
                    selected={startTime}
                    onChange={(time: Date | null) => time && setStartTime(time)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
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
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date | null) => date && setEndDate(date)}
                      dateFormat="MMM d, yyyy"
                      className={styles.datePicker}
                      disabled={loading}
                      minDate={startDate}
                    />
                  )}
                  {!allDay && (
                    <DatePicker
                      selected={endTime}
                      onChange={(time: Date | null) => time && setEndTime(time)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
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
              {loading ? "Creating..." : "Create Event"}
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
