import type { Event } from "../atoms/eventAtom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(`${API_BASE}/events`);
  console.log("Fetching events:", res);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function createEvent(event: Omit<Event, "id">): Promise<Event> {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function fetchEventById(id: number): Promise<Event> {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}
