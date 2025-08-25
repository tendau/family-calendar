import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, startOfWeek, endOfWeek, addMonths, subMonths, addDays } from "date-fns";
import { useLoaderData } from "react-router";
import type { LoaderFunction } from "react-router";

import type { Event } from "../atoms/eventAtom";
import { AddEventForm } from "../components/AddEventForm";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { DayModal } from "../components/DayModal";
import { fetchEvents } from "../api/events";
import { formatServerDate, parseServerDateTime, parseServerDate } from "../utils/datetime";
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
  const [selectedDay, setSelectedDay] = useState<{ date: Date; events: Event[] } | null>(null);

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

  // Map events to each calendar day they occupy (handles multi-day and all-day)
  const eventsByDate: Record<string, Event[]> = {};
  const eventPositions: Record<string, Record<number, 'start' | 'middle' | 'end' | 'single'>> = {};
  
  events.forEach((e) => {
    try {
      if (e.all_day) {
        // For all-day events, treat end_time as exclusive (typical calendar behavior)
        const start = parseServerDate(e.start_time, true);
        const end = parseServerDate(e.end_time, true);
        // end is exclusive: we will iterate from start up to (but not including) end
        const eventDays: string[] = [];
        let cursor = start;
        while (cursor < end) {
          const dateKey = format(cursor, "yyyy-MM-dd");
          eventDays.push(dateKey);
          if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
          eventsByDate[dateKey].push(e);
          cursor = addDays(cursor, 1);
        }
        
        // Set position indicators for multi-day events
        eventDays.forEach((dateKey, index) => {
          if (!eventPositions[dateKey]) eventPositions[dateKey] = {};
          if (eventDays.length === 1) {
            eventPositions[dateKey][e.id] = 'single';
          } else if (index === 0) {
            eventPositions[dateKey][e.id] = 'start';
          } else if (index === eventDays.length - 1) {
            eventPositions[dateKey][e.id] = 'end';
          } else {
            eventPositions[dateKey][e.id] = 'middle';
          }
        });
      } else {
        // Timed events: map to the start local date only (could be extended later)
        const localDate = parseServerDateTime(e.start_time);
        const dateKey = format(localDate, "yyyy-MM-dd");
        if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
        eventsByDate[dateKey].push(e);
        if (!eventPositions[dateKey]) eventPositions[dateKey] = {};
        eventPositions[dateKey][e.id] = 'single';
      }
    } catch (err) {
      // Fallback to putting it on the start date
      const localDate = parseServerDateTime(e.start_time);
      const dateKey = format(localDate, "yyyy-MM-dd");
      if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
      eventsByDate[dateKey].push(e);
      if (!eventPositions[dateKey]) eventPositions[dateKey] = {};
      eventPositions[dateKey][e.id] = 'single';
    }
  });

  console.log("Events by date:", eventsByDate);

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;

  return (
    <div className={styles.calendarContainer}>
      {/* Month Navigation Header */}
      <div className={styles.monthHeader}>
        <button 
          onClick={goToPreviousMonth}
          className={styles.navButton}
          aria-label="Previous month"
        >
          ‹
        </button>
        
        <h2 className={styles.monthTitle}>
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        
        <button 
          onClick={goToNextMonth}
          className={styles.navButton}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      
      {/* Today Button */}
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
          const dayEvents = eventsByDate[dayStr] || [];
          const maxVisibleEvents = 3;
          const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
          const hiddenCount = dayEvents.length - maxVisibleEvents;
          
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
              onClick={() => {
                setSelectedDay({ date: day, events: dayEvents });
              }}
            >
              <div className={styles.dayNumber}>{format(day, "d")}</div>
              {isCurrentMonth && visibleEvents.map((event) => {
                const position = eventPositions[dayStr]?.[event.id] || 'single';
                const baseClass = event.all_day ? `${styles.eventBadge} ${styles.eventBadgeAllDay}` : styles.eventBadge;
                const positionClass = event.all_day ? styles[`eventPosition${position.charAt(0).toUpperCase() + position.slice(1)}`] : '';
                
                return (
                  <div 
                    key={event.id} 
                    className={`${baseClass} ${positionClass}`.trim()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEventId(event.id);
                    }}
                  >
                    {position === 'middle' ? '···' : event.title}
                  </div>
                );
              })}
              {isCurrentMonth && hiddenCount > 0 && (
                <div className={styles.moreEventsIndicator}>
                  +{hiddenCount} more
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Add Event Button */}
      <button 
        className={styles.addEventBtn}
        onClick={() => setShowForm(true)}
        aria-label="Add new event"
      >
        +
      </button>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailsModal
          eventId={selectedEvent.id}
          onClose={() => setSelectedEventId(null)}
        />
      )}

      {showForm && (
        <AddEventForm onClose={() => setShowForm(false)} />
      )}

      {selectedDay && (
        <DayModal
          date={selectedDay.date}
          events={selectedDay.events}
          onClose={() => setSelectedDay(null)}
          onEventClick={(eventId) => setSelectedEventId(eventId)}
        />
      )}
    </div>
  );
}
