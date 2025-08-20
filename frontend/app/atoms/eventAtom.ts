import { atom } from "jotai";

export interface Event {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  description?: string;
}

export const eventsAtom = atom<Event[]>([]);
