import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { Event } from "../atoms/eventAtom";
import { fetchEventById } from "../api/events";
import { formatServerDate, formatServerTime, formatServerDateTimeWithTimezone } from "../utils/datetime";
import styles from "./EventDetailsModal.module.css";

interface EventDetailsModalProps {
  eventId: number;
  onClose: () => void;
}

export function EventDetailsModal({ eventId, onClose }: EventDetailsModalProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await fetchEventById(eventId);
        setEvent(eventData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Event Details</h2>
          <button 
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>Loading event details...</div>
          )}
          
          {error && (
            <div className={styles.error}>Error: {error}</div>
          )}
          
          {event && (
            <div className={styles.eventDetails}>
              <div className={styles.eventHeader}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <div className={`${styles.eventType} ${event.all_day ? styles.allDay : styles.timed}`}>
                  {event.all_day ? "ALL DAY" : "TIMED"}
                </div>
              </div>

              {event.description && (
                <div className={styles.eventDescription}>
                  {event.description}
                </div>
              )}

              <div className={styles.timeDetails}>
                <div className={styles.timeItem}>
                  <div className={styles.timeLabel}>Start Time</div>
                  <div className={styles.timeValue}>
                    {event.all_day ? (
                      formatServerDate(event.start_time)
                    ) : (
                      <>
                        <div className={styles.timeDate}>
                          {formatServerDateTimeWithTimezone(event.start_time).date}
                        </div>
                        <div className={styles.timeTime}>
                          {formatServerDateTimeWithTimezone(event.start_time).time}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.timeItem}>
                  <div className={styles.timeLabel}>End Time</div>
                  <div className={styles.timeValue}>
                    {event.all_day ? (
                      formatServerDate(event.end_time)
                    ) : (
                      <>
                        <div className={styles.timeDate}>
                          {formatServerDateTimeWithTimezone(event.end_time).date}
                        </div>
                        <div className={styles.timeTime}>
                          {formatServerDateTimeWithTimezone(event.end_time).time}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {event.google_id && (
                <div className={styles.googleBadge}>
                  Synced with Google Calendar
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
