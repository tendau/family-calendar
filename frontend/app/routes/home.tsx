import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { useLoaderData } from "react-router";
import type { LoaderFunction } from "react-router";

import type { Event } from "../atoms/eventAtom";
import { AddEventForm } from "../components/AddEventForm";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { fetchEvents } from "../api/events";
import { formatServerDate, parseServerDateTime } from "../utils/datetime";
import styles from "./home.module.css";

// --- Loader ---
export const loader: LoaderFunction = async ({ request }) => {
  const events = await fetchEvents();
  console.log("Fetched events:", events);
  return events;
};

// --- Component ---
export default function Home() {
  const events = useLoaderData() as Event[];
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Get the start of the week for the first day of the month
  const calendarStart = startOfWeek(monthStart);
  // Get the end of the week for the last day of the month
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventsByDate: Record<string, Event[]> = {};
  events.forEach((e) => {
    // Parse the server datetime and convert to local timezone, then get the local date
    const localDate = parseServerDateTime(e.start_time);
    const date = format(localDate, "yyyy-MM-dd");
    if (!eventsByDate[date]) eventsByDate[date] = [];
    eventsByDate[date].push(e);
  });

  console.log("Events by date:", eventsByDate);

  return (
    <div className={styles.calendarContainer}>
      {/* Calendar */}
      <div>
        <div className={styles.monthHeader}>
          <button 
            onClick={goToPreviousMonth}
            className={styles.navButton}
            aria-label="Previous month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <h2 className={styles.monthTitle}>
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          
          <button 
            onClick={goToNextMonth}
            className={styles.navButton}
            aria-label="Next month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.todayButton}>
          <button 
            onClick={goToToday}
            className={styles.todayBtn}
          >
            Today
          </button>
        </div>
        
        {/* Day headers */}
        <div className={styles.dayHeaders}>
          {dayHeaders.map((day) => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={styles.calendarGrid}>
          {days.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            return (
              <div
                key={dayStr}
                className={
                  isToday(day)
                    ? `${styles.dayCell} ${styles.dayCellToday}`
                    : styles.dayCell
                }
                style={{
                  opacity: isCurrentMonth ? 1 : 0.3
                }}
              >
                <div className={styles.dayNumber}>{format(day, "d")}</div>
                {isCurrentMonth && eventsByDate[dayStr]?.map((event) => (
                  <div 
                    key={event.id} 
                    className={styles.eventBadge}
                    onClick={() => setSelectedEventId(event.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedEventId(event.id);
                      }
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Upcoming Events</h2>
        {events
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .slice(0, 5)
          .map((event) => (
            <div 
              key={event.id} 
              className={styles.sidebarEvent}
              onClick={() => setSelectedEventId(event.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedEventId(event.id);
                }
              }}
            >
              <div className={styles.sidebarEventTitle}>{event.title}</div>
              <div className={styles.sidebarEventDate}>{formatServerDate(event.start_time)}</div>
            </div>
          ))}

        <button
          className={styles.addEventBtn}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Close Form" : "+ Add Event"}
        </button>

        {showForm && <AddEventForm onClose={() => setShowForm(false)} />}
      </div>

      {/* Event Details Modal */}
      {selectedEventId && (
        <EventDetailsModal 
          eventId={selectedEventId} 
          onClose={() => setSelectedEventId(null)} 
        />
      )}
    </div>
  );
}
