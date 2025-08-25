const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function syncGoogleCalendar(): Promise<{ message?: string; synced?: number; status?: string }> {
  const res = await fetch(`${API_BASE}/google/sync`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sync failed: ${res.status} ${text}`);
  }
  return res.json();
}

export default { syncGoogleCalendar };
