import { atom } from "jotai";

export interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
}

export const eventsAtom = atom<Event[]>([
  { id: "1", title: "Family Dinner", date: "2025-08-22" },
  { id: "2", title: "Soccer Practice", date: "2025-08-23" },
  { id: "3", title: "Doctor Appointment", date: "2025-08-25" },
]);
