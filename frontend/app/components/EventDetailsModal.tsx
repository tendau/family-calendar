import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { Event } from "../atoms/eventAtom";
import { fetchEventById } from "../api/events";
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      // Create date object - this will automatically convert to local timezone
      const date = new Date(dateTimeString);
      return format(date, "EEEE, MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateTimeString;
    }
  };

  const formatDate = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return format(date, "MMM d, yyyy");
    } catch {
      return dateTimeString;
    }
  };

  const formatTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return format(date, "h:mm a");
    } catch {
      return dateTimeString;
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Event Details
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {loading && <div className={styles.loading}>Loading event details...</div>}
          
          {error && <div className={styles.error}>Error: {error}</div>}
          
          {event && (
            <div className={styles.eventDetails}>
              {/* Event Title - Hero Section */}
              <div className={styles.heroSection}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                {event.description && (
                  <p className={styles.eventDescription}>{event.description}</p>
                )}
              </div>

              {/* Time Information - Creative Layout */}
              <div className={styles.timeSection}>
                <div className={styles.timeHeader}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Event Schedule</span>
                </div>
                
                <div className={styles.timeFlow}>
                  <div className={styles.timePoint}>
                    <div className={styles.timeLabel}>Starts</div>
                    <div className={styles.timeValue}>
                      {event.all_day ? formatDate(event.start_time) : (
                        <>
                          <div className={styles.timeDate}>{format(new Date(event.start_time), "EEEE, MMM d")}</div>
                          <div className={styles.timeTime}>{formatTime(event.start_time)}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.timeDivider}>
                    <div className={styles.timeLine}></div>
                    <div className={styles.timeArrow}>→</div>
                  </div>
                  
                  <div className={styles.timePoint}>
                    <div className={styles.timeLabel}>Ends</div>
                    <div className={styles.timeValue}>
                      {event.all_day ? formatDate(event.end_time) : (
                        <>
                          <div className={styles.timeDate}>{format(new Date(event.end_time), "EEEE, MMM d")}</div>
                          <div className={styles.timeTime}>{formatTime(event.end_time)}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {event.all_day && (
                  <div className={styles.allDayBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
                    </svg>
                    All Day Event
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
