import { format } from "date-fns";
import type { Event } from "../atoms/eventAtom";
import { formatServerTime } from "../utils/datetime";
import { MdClose } from "react-icons/md";
import styles from "./DayModal.module.css";

export interface DayModalProps {
  date: Date;
  events: Event[];
  onClose: () => void;
  onEventClick: (eventId: number) => void;
}

export function DayModal({ date, events, onClose, onEventClick }: DayModalProps) {
  const sortedEvents = events.sort((a, b) => {
    // All-day events first, then by start time
    if (a.all_day && !b.all_day) return -1;
    if (!a.all_day && b.all_day) return 1;
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {format(date, "EEEE, MMMM d, yyyy")}
          </h2>
          <button 
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <MdClose />
          </button>
        </div>
        
        <div className={styles.content}>
          {sortedEvents.length === 0 ? (
            <div className={styles.noEvents}>
              No events scheduled for this day
            </div>
          ) : (
            <div className={styles.eventsList}>
              {sortedEvents.map((event) => (
                <div 
                  key={event.id}
                  className={styles.eventItem}
                  onClick={() => onEventClick(event.id)}
                >
                  <div className={styles.eventTime}>
                    {event.all_day ? "All Day" : formatServerTime(event.start_time)}
                  </div>
                  <div className={styles.eventDetails}>
                    <div className={styles.eventTitle}>{event.title}</div>
                    {event.description && (
                      <div className={styles.eventDescription}>
                        {event.description}
                      </div>
                    )}
                  </div>
                  <div className={`${styles.eventType} ${event.all_day ? styles.allDay : styles.timed}`}>
                    {event.all_day ? "ALL DAY" : "TIMED"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
