import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { useLoaderData } from "react-router";
import type { LoaderFunction } from "react-router"; 

import type { Event } from "../atoms/eventAtom";
import { AddEventForm } from "../components/AddEventForm";
import { fetchEvents } from "../api/events";

// --- Loader ---
export const loader: LoaderFunction = async ({ request }) => {
  const events = await fetchEvents();
  return events;
};

// --- Component ---
export default function Home() {
  const events = useLoaderData() as Event[];
  const [currentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsByDate: Record<string, Event[]> = {};
  events.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  return (
    <div className="flex gap-4 p-4">
      {/* Calendar */}
      <div className="flex-1 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          return (
            <div
              key={dayStr}
              className={`p-2 border rounded ${isToday(day) ? "bg-yellow-200" : ""}`}
            >
              <div>{format(day, "d")}</div>
              {eventsByDate[dayStr]?.map((event) => (
                <div key={event.id} className="text-xs bg-blue-200 rounded p-1 mt-1">
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Sidebar */}
      <div className="w-64 p-2 border rounded flex flex-col gap-2">
        <h2 className="font-bold">Upcoming Events</h2>
        {events
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 5)
          .map((event) => (
            <div key={event.id} className="p-1 border rounded">
              <div className="font-semibold">{event.title}</div>
              <div className="text-xs text-gray-600">{event.date}</div>
            </div>
          ))}

        <button
          className="mt-2 bg-green-500 text-white p-2 rounded"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Close Form" : "+ Add Event"}
        </button>

        {showForm && <AddEventForm onClose={() => setShowForm(false)} />}
      </div>
    </div>
  );
}
