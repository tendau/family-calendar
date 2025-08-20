import { atom } from "jotai";

export interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  description?: string;
  google_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const eventsAtom = atom<Event[]>([]);
