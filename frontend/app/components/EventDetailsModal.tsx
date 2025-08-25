import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { format } from "date-fns";
import type { Event } from "../atoms/eventAtom";
import { eventsAtom } from "../atoms/eventAtom";
import { fetchEventById, deleteEvent } from "../api/events";
import { formatServerDate, formatServerTime, formatServerDateTimeWithTimezone } from "../utils/datetime";
import { MdClose, MdEdit, MdDelete, MdWarning } from "react-icons/md";
import { EditEventForm } from "./EditEventForm";
import { Toast } from "./Toast";
import styles from "./EventDetailsModal.module.css";

interface EventDetailsModalProps {
  eventId: number;
  onClose: () => void;
}

export function EventDetailsModal({ eventId, onClose }: EventDetailsModalProps) {
  const [, setEvents] = useAtom(eventsAtom);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

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

  const handleDelete = async () => {
    if (!event) return;
    
    setDeleteLoading(true);
    try {
      await deleteEvent(event.id);
      setToast({ message: "Event deleted successfully!", type: "success" });
      
      // Remove from events atom
      setEvents((prev) => prev.filter(e => e.id !== event.id));
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to delete event", type: "error" });
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdate = (updatedEvent: Event) => {
    setEvent(updatedEvent);
    setShowEditForm(false);
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  // Show edit form if requested
  if (showEditForm && event) {
    return (
      <EditEventForm
        event={event}
        onClose={() => setShowEditForm(false)}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Event Details</h2>
          <div className={styles.headerActions}>
            {event && (
              <>
                <button 
                  className={styles.editBtn}
                  onClick={() => setShowEditForm(true)}
                  aria-label="Edit event"
                  disabled={loading}
                >
                  <MdEdit />
                </button>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Delete event"
                  disabled={loading}
                >
                  <MdDelete />
                </button>
              </>
            )}
            <button 
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <MdClose />
            </button>
          </div>
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmModal}>
              <div className={styles.confirmHeader}>
                <MdWarning className={styles.warningIcon} />
                <h3>Delete Event</h3>
              </div>
              <div className={styles.confirmContent}>
                <p>Are you sure you want to delete "<strong>{event?.title}</strong>"?</p>
                <p>This action cannot be undone.</p>
              </div>
              <div className={styles.confirmActions}>
                <button 
                  className={styles.confirmCancelBtn}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button 
                  className={styles.confirmDeleteBtn}
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

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
}
