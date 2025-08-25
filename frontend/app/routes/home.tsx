import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, startOfWeek, endOfWeek, addMonths, subMonths, addDays, isAfter } from "date-fns";
import { useLoaderData } from "react-router";
import type { LoaderFunction } from "react-router";
import { MdPalette, MdCalendarToday, MdAdd, MdClose, MdMenu, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { HexColorPicker } from "react-colorful";

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
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [customTheme, setCustomTheme] = useState(() => {
    // Try to load custom theme from localStorage
    if (typeof window !== 'undefined') {
      const savedCustomTheme = localStorage.getItem('familyCalendarCustomTheme');
      if (savedCustomTheme) {
        try {
          return JSON.parse(savedCustomTheme);
        } catch (e) {
          console.error('Failed to parse saved custom theme:', e);
        }
      }
    }
    // Default custom theme
    return {
      name: 'Custom',
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      eventBg: '#f0f9ff',
      eventText: '#1e40af',
      eventBorder: '#e0e7ff',
      allDayBg: '#fef3c7',
      allDayText: '#92400e',
      allDayBorder: '#fbbf24',
      todayBg: '#3b82f6',
      todayText: '#ffffff',
      todayBorder: '#1e40af',
      modalBg: '#ffffff',
      modalText: '#1f2937',
      modalBorder: '#e5e7eb',
      modalOverlay: 'rgba(0, 0, 0, 0.5)',
      buttonBg: '#3b82f6',
      buttonText: '#ffffff',
      buttonHover: '#2563eb',
      danger: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b'
    };
  });
  
  // Theme state with localStorage persistence
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Try to load theme from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('familyCalendarTheme');
      if (savedTheme) {
        try {
          return JSON.parse(savedTheme);
        } catch (e) {
          console.error('Failed to parse saved theme:', e);
        }
      }
    }
    // Default theme if nothing saved
    return {
      name: 'Blue Ocean',
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      eventBg: '#f0f9ff',
      eventText: '#1e40af',
      eventBorder: '#e0e7ff',
      allDayBg: '#fef3c7',
      allDayText: '#92400e',
      allDayBorder: '#fbbf24',
      todayBg: '#3b82f6',
      todayText: '#ffffff',
      todayBorder: '#1e40af',
      modalBg: '#ffffff',
      modalText: '#1f2937',
      modalBorder: '#e5e7eb',
      modalOverlay: 'rgba(0, 0, 0, 0.5)',
      buttonBg: '#3b82f6',
      buttonText: '#ffffff',
      buttonHover: '#2563eb',
      danger: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b'
    };
  });

  // Predefined themes (including custom)
  const themes = [
    {
      name: 'Blue Ocean',
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      eventBg: '#f0f9ff',
      eventText: '#1e40af',
      eventBorder: '#e0e7ff',
      allDayBg: '#fef3c7',
      allDayText: '#92400e',
      allDayBorder: '#fbbf24',
      todayBg: '#3b82f6',
      todayText: '#ffffff',
      todayBorder: '#1e40af',
      modalBg: '#ffffff',
      modalText: '#1f2937',
      modalBorder: '#e5e7eb',
      modalOverlay: 'rgba(59, 130, 246, 0.1)',
      buttonBg: '#3b82f6',
      buttonText: '#ffffff',
      buttonHover: '#2563eb',
      danger: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b'
    },
    {
      name: 'Forest Green',
      primary: '#10b981',
      secondary: '#047857',
      accent: '#34d399',
      eventBg: '#ecfdf5',
      eventText: '#047857',
      eventBorder: '#d1fae5',
      allDayBg: '#fef7ff',
      allDayText: '#7c2d12',
      allDayBorder: '#f97316',
      todayBg: '#10b981',
      todayText: '#ffffff',
      todayBorder: '#047857',
      modalBg: '#ffffff',
      modalText: '#1f2937',
      modalBorder: '#d1fae5',
      modalOverlay: 'rgba(16, 185, 129, 0.1)',
      buttonBg: '#10b981',
      buttonText: '#ffffff',
      buttonHover: '#059669',
      danger: '#dc2626',
      success: '#10b981',
      warning: '#f59e0b'
    },
    {
      name: 'Purple Dreams',
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      eventBg: '#f5f3ff',
      eventText: '#7c3aed',
      eventBorder: '#e9d5ff',
      allDayBg: '#fef2f2',
      allDayText: '#dc2626',
      allDayBorder: '#f87171',
      todayBg: '#8b5cf6',
      todayText: '#ffffff',
      todayBorder: '#7c3aed',
      modalBg: '#ffffff',
      modalText: '#1f2937',
      modalBorder: '#e9d5ff',
      modalOverlay: 'rgba(139, 92, 246, 0.1)',
      buttonBg: '#8b5cf6',
      buttonText: '#ffffff',
      buttonHover: '#7c3aed',
      danger: '#dc2626',
      success: '#059669',
      warning: '#f59e0b'
    },
    {
      name: 'Sunset Orange',
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24',
      eventBg: '#fffbeb',
      eventText: '#d97706',
      eventBorder: '#fed7aa',
      allDayBg: '#f0fdf4',
      allDayText: '#15803d',
      allDayBorder: '#4ade80',
      todayBg: '#f59e0b',
      todayText: '#ffffff',
      todayBorder: '#d97706',
      modalBg: '#ffffff',
      modalText: '#1f2937',
      modalBorder: '#fed7aa',
      modalOverlay: 'rgba(245, 158, 11, 0.1)',
      buttonBg: '#f59e0b',
      buttonText: '#ffffff',
      buttonHover: '#d97706',
      danger: '#dc2626',
      success: '#059669',
      warning: '#f59e0b'
    },
    {
      name: 'Rose Pink',
      primary: '#ec4899',
      secondary: '#be185d',
      accent: '#f472b6',
      eventBg: '#fdf2f8',
      eventText: '#be185d',
      eventBorder: '#fce7f3',
      allDayBg: '#f0f9ff',
      allDayText: '#0369a1',
      allDayBorder: '#38bdf8',
      todayBg: '#ec4899',
      todayText: '#ffffff',
      todayBorder: '#be185d',
      modalBg: '#ffffff',
      modalText: '#1f2937',
      modalBorder: '#fce7f3',
      modalOverlay: 'rgba(236, 72, 153, 0.1)',
      buttonBg: '#ec4899',
      buttonText: '#ffffff',
      buttonHover: '#be185d',
      danger: '#dc2626',
      success: '#059669',
      warning: '#f59e0b'
    },
    // Custom theme option
    customTheme
  ];

  // Apply theme to CSS custom properties
  const applyTheme = (theme: typeof currentTheme) => {
    const root = document.documentElement;
    // Basic theme colors
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    
    // Event colors
    root.style.setProperty('--theme-event-bg', theme.eventBg);
    root.style.setProperty('--theme-event-text', theme.eventText);
    root.style.setProperty('--theme-event-border', theme.eventBorder);
    
    // All-day event colors
    root.style.setProperty('--theme-allday-bg', theme.allDayBg);
    root.style.setProperty('--theme-allday-text', theme.allDayText);
    root.style.setProperty('--theme-allday-border', theme.allDayBorder);
    
    // Today cell colors
    root.style.setProperty('--theme-today-bg', theme.todayBg);
    root.style.setProperty('--theme-today-text', theme.todayText);
    root.style.setProperty('--theme-today-border', theme.todayBorder);
    
    // Modal colors
    root.style.setProperty('--theme-modal-bg', theme.modalBg);
    root.style.setProperty('--theme-modal-text', theme.modalText);
    root.style.setProperty('--theme-modal-border', theme.modalBorder);
    root.style.setProperty('--theme-modal-overlay', theme.modalOverlay);
    
    // Button colors
    root.style.setProperty('--theme-button-bg', theme.buttonBg);
    root.style.setProperty('--theme-button-text', theme.buttonText);
    root.style.setProperty('--theme-button-hover', theme.buttonHover);
    
    // Status colors
    root.style.setProperty('--theme-danger', theme.danger);
    root.style.setProperty('--theme-success', theme.success);
    root.style.setProperty('--theme-warning', theme.warning);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeColorPicker && !(event.target as Element).closest('.colorPickerContainer')) {
        setActiveColorPicker(null);
      }
    };

    if (activeColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeColorPicker]);

  // Function to change theme and save to localStorage
  const changeTheme = (theme: typeof currentTheme) => {
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('familyCalendarTheme', JSON.stringify(theme));
    }
  };

  // Function to update custom theme
  const updateCustomTheme = (updates: Partial<typeof customTheme>) => {
    const newCustomTheme = { ...customTheme, ...updates };
    setCustomTheme(newCustomTheme);
    // Save custom theme to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('familyCalendarCustomTheme', JSON.stringify(newCustomTheme));
    }
    // If current theme is custom, update it immediately
    if (currentTheme.name === 'Custom') {
      changeTheme(newCustomTheme);
    }
  };

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

  // Get upcoming events (next 30 days starting from today)
  const today = new Date();
  const upcomingEvents = events
    .filter(event => {
      try {
        const eventDate = event.all_day 
          ? parseServerDate(event.start_time)
          : parseServerDateTime(event.start_time);
        return isAfter(eventDate, today) || format(eventDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      const dateA = a.all_day ? parseServerDate(a.start_time) : parseServerDateTime(a.start_time);
      const dateB = b.all_day ? parseServerDate(b.start_time) : parseServerDateTime(b.start_time);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 10); // Show next 10 events

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.calendarContainer}>
      {/* Month Navigation Header */}
      <div className={styles.monthHeader}>
        <button 
          onClick={goToPreviousMonth}
          className={styles.navButton}
          aria-label="Previous month"
        >
          <MdChevronLeft />
        </button>
        
        <h2 className={styles.monthTitle}>
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        
        <button 
          onClick={goToNextMonth}
          className={styles.navButton}
          aria-label="Next month"
        >
          <MdChevronRight />
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

      {/* Floating Action Buttons */}
      <div className={styles.floatingActions}>
        {/* Expanded action buttons */}
        <div className={`${styles.actionButtons} ${fabExpanded ? styles.actionButtonsExpanded : ''}`}>
          <button 
            className={`${styles.actionBtn} ${styles.themeBtn}`}
            onClick={() => {
              setShowThemeSettings(true);
              setFabExpanded(false);
            }}
            aria-label="Theme settings"
          >
            <MdPalette />
          </button>
          
          <button 
            className={`${styles.actionBtn} ${styles.upcomingBtn}`}
            onClick={() => {
              setShowUpcoming(true);
              setFabExpanded(false);
            }}
            aria-label="View upcoming events"
          >
            <MdCalendarToday />
          </button>
          
          <button 
            className={`${styles.actionBtn} ${styles.addEventBtn}`}
            onClick={() => {
              setShowForm(true);
              setFabExpanded(false);
            }}
            aria-label="Add new event"
          >
            <MdAdd />
          </button>
        </div>

        {/* Main FAB toggle button */}
        <button 
          className={`${styles.mainFab} ${fabExpanded ? styles.mainFabExpanded : ''}`}
          onClick={() => setFabExpanded(!fabExpanded)}
          aria-label={fabExpanded ? "Close menu" : "Open menu"}
        >
          {fabExpanded ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailsModal
          eventId={selectedEvent.id}
          onClose={() => setSelectedEventId(null)}
        />
      )}

      {showForm && (
        <AddEventForm 
          onClose={() => setShowForm(false)} 
          initialDate={selectedDay?.date}
        />
      )}

      {selectedDay && (
        <DayModal
          date={selectedDay.date}
          events={selectedDay.events}
          onClose={() => setSelectedDay(null)}
          onEventClick={(eventId) => setSelectedEventId(eventId)}
        />
      )}

      {/* Upcoming Events Modal */}
      {showUpcoming && (
        <div className={styles.modalOverlay} onClick={() => setShowUpcoming(false)}>
          <div className={styles.upcomingModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.upcomingHeader}>
              <h2>Upcoming Events</h2>
              <button 
                onClick={() => setShowUpcoming(false)}
                className={styles.closeBtn}
                aria-label="Close upcoming events"
              >
                <MdClose />
              </button>
            </div>
            <div className={styles.upcomingList}>
              {upcomingEvents.length === 0 ? (
                <p className={styles.noEvents}>No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => {
                  const eventDate = event.all_day 
                    ? parseServerDate(event.start_time)
                    : parseServerDateTime(event.start_time);
                  
                  return (
                    <div 
                      key={event.id} 
                      className={styles.upcomingEvent}
                      onClick={() => {
                        setShowUpcoming(false);
                        setSelectedEventId(event.id);
                      }}
                    >
                      <div className={styles.upcomingEventDate}>
                        {format(eventDate, 'MMM d, yyyy')}
                        {!event.all_day && (
                          <span className={styles.upcomingEventTime}>
                            {format(eventDate, 'h:mm a')}
                          </span>
                        )}
                      </div>
                      <div className={styles.upcomingEventTitle}>{event.title}</div>
                      {event.description && (
                        <div className={styles.upcomingEventDesc}>{event.description}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Theme Settings Modal */}
      {showThemeSettings && (
        <div className={styles.modalOverlay} onClick={() => setShowThemeSettings(false)}>
          <div className={styles.themeModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.themeHeader}>
              <h2>Theme Settings</h2>
              <button 
                onClick={() => setShowThemeSettings(false)}
                className={styles.closeBtn}
                aria-label="Close theme settings"
              >
                <MdClose />
              </button>
            </div>
            <div className={styles.themeContent}>
              <h3>Choose a Theme</h3>
              <div className={styles.themeGrid}>
                {themes.map((theme) => (
                  <div 
                    key={theme.name}
                    className={`${styles.themeCard} ${currentTheme.name === theme.name ? styles.themeCardActive : ''}`}
                    onClick={() => changeTheme(theme)}
                  >
                    <div className={styles.themePreview}>
                      <div 
                        className={styles.themeColorPrimary}
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div 
                        className={styles.themeColorSecondary}
                        style={{ backgroundColor: theme.secondary }}
                      />
                      <div 
                        className={styles.themeColorAccent}
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                    <div className={styles.themeName}>{theme.name}</div>
                  </div>
                ))}
              </div>
              
              {/* Custom Theme Editor */}
              {currentTheme.name === 'Custom' && (
                <div className={styles.customThemeSection}>
                  <h4>Customize Theme</h4>
                  <div className={styles.colorInputGrid}>
                    <div className={styles.colorInputWrapper}>
                      <label>Primary Color</label>
                      <div className={`${styles.colorPickerContainer} colorPickerContainer`}>
                        <div 
                          className={styles.colorSwatch}
                          style={{ backgroundColor: customTheme.primary }}
                          onClick={() => setActiveColorPicker(activeColorPicker === 'primary' ? null : 'primary')}
                        />
                        {activeColorPicker === 'primary' && (
                          <div className={styles.colorPickerPopover}>
                            <HexColorPicker 
                              color={customTheme.primary} 
                              onChange={(color) => updateCustomTheme({ primary: color })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.colorInputWrapper}>
                      <label>Secondary Color</label>
                      <div className={`${styles.colorPickerContainer} colorPickerContainer`}>
                        <div 
                          className={styles.colorSwatch}
                          style={{ backgroundColor: customTheme.secondary }}
                          onClick={() => setActiveColorPicker(activeColorPicker === 'secondary' ? null : 'secondary')}
                        />
                        {activeColorPicker === 'secondary' && (
                          <div className={styles.colorPickerPopover}>
                            <HexColorPicker 
                              color={customTheme.secondary} 
                              onChange={(color) => updateCustomTheme({ secondary: color })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.colorInputWrapper}>
                      <label>Accent Color</label>
                      <div className={`${styles.colorPickerContainer} colorPickerContainer`}>
                        <div 
                          className={styles.colorSwatch}
                          style={{ backgroundColor: customTheme.accent }}
                          onClick={() => setActiveColorPicker(activeColorPicker === 'accent' ? null : 'accent')}
                        />
                        {activeColorPicker === 'accent' && (
                          <div className={styles.colorPickerPopover}>
                            <HexColorPicker 
                              color={customTheme.accent} 
                              onChange={(color) => updateCustomTheme({ accent: color })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.colorInputWrapper}>
                      <label>Event Background</label>
                      <div className={`${styles.colorPickerContainer} colorPickerContainer`}>
                        <div 
                          className={styles.colorSwatch}
                          style={{ backgroundColor: customTheme.eventBg }}
                          onClick={() => setActiveColorPicker(activeColorPicker === 'eventBg' ? null : 'eventBg')}
                        />
                        {activeColorPicker === 'eventBg' && (
                          <div className={styles.colorPickerPopover}>
                            <HexColorPicker 
                              color={customTheme.eventBg} 
                              onChange={(color) => updateCustomTheme({ eventBg: color })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.colorInputWrapper}>
                      <label>Event Text</label>
                      <div className={`${styles.colorPickerContainer} colorPickerContainer`}>
                        <div 
                          className={styles.colorSwatch}
                          style={{ backgroundColor: customTheme.eventText }}
                          onClick={() => setActiveColorPicker(activeColorPicker === 'eventText' ? null : 'eventText')}
                        />
                        {activeColorPicker === 'eventText' && (
                          <div className={styles.colorPickerPopover}>
                            <HexColorPicker 
                              color={customTheme.eventText} 
                              onChange={(color) => updateCustomTheme({ eventText: color })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.colorInputWrapper}>
                      <label>Today Background</label>
                      <div className={`${styles.colorPickerContainer} colorPickerContainer`}>
                        <div 
                          className={styles.colorSwatch}
                          style={{ backgroundColor: customTheme.todayBg }}
                          onClick={() => setActiveColorPicker(activeColorPicker === 'todayBg' ? null : 'todayBg')}
                        />
                        {activeColorPicker === 'todayBg' && (
                          <div className={styles.colorPickerPopover}>
                            <HexColorPicker 
                              color={customTheme.todayBg} 
                              onChange={(color) => updateCustomTheme({ todayBg: color })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={styles.themePreviewSection}>
                <h4>Preview</h4>
                <div className={styles.mockCalendar}>
                  <div className={styles.mockHeader} style={{ 
                    background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                  }}>
                    Sample Header
                  </div>
                  <div className={styles.mockEvents}>
                    <div 
                      className={styles.mockEvent}
                      style={{
                        backgroundColor: currentTheme.eventBg,
                        color: currentTheme.eventText,
                        border: `1px solid ${currentTheme.eventBorder}`
                      }}
                    >
                      Regular Event
                    </div>
                    <div 
                      className={styles.mockEvent}
                      style={{
                        backgroundColor: currentTheme.allDayBg,
                        color: currentTheme.allDayText,
                        border: `1px solid ${currentTheme.allDayBorder}`
                      }}
                    >
                      All-Day Event
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
