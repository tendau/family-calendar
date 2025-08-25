import { ThemeToggle } from "./ThemeToggle";
import { Toast } from "./Toast";
import { syncGoogleCalendar } from "../api/google";
import { useState } from "react";
import { MdExpandMore, MdExpandLess, MdSync } from "react-icons/md";

export function Header() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [hidden, setHidden] = useState(false);

  const handleSync = async () => {
    try {
      setLoading(true);
      const res = await syncGoogleCalendar();
      const syncedCount = res?.synced || 0;
      setToast({
        message: `Google sync completed! ${syncedCount} events synced.`,
        type: "success"
      });
    } catch (err: any) {
      setToast({
        message: err?.message || "Google sync failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (hidden) {
    return (
      <>
        <button 
          onClick={() => setHidden(false)}
          className="header-show-btn"
          aria-label="Show header"
        >
          <MdExpandMore />
        </button>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </>
    );
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Family Calendar</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={handleSync} disabled={loading} className="syncBtn">
            <MdSync />
            {loading ? "Syncing..." : "Sync"}
          </button>
          <ThemeToggle />
        </div>
      </div>
      
      <button 
        onClick={() => setHidden(true)}
        className="header-hide-btn"
        aria-label="Hide header"
      >
        <MdExpandLess />
      </button>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </header>
  );
}
