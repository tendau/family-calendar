import { Link, useLocation } from "react-router";
import { ThemeToggle } from "./ThemeToggle";
import { Toast } from "./Toast";
import { syncGoogleCalendar } from "../api/google";
import { useState } from "react";
import { MdExpandMore, MdExpandLess, MdSync, MdCalendarToday, MdCelebration, MdShoppingCart } from "react-icons/md";

export function Header() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [hidden, setHidden] = useState(false);

  const navigationItems = [
    { path: "/", label: "Calendar", icon: <MdCalendarToday /> },
    { path: "/fun", label: "Fun", icon: <MdCelebration /> },
    { path: "/grocery-list", label: "Grocery List", icon: <MdShoppingCart /> },
  ];

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
        <h1 className="header-title">Family Hub</h1>
        
        <nav className="header-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'nav-item-active' : ''}`}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {location.pathname === "/" && (
            <button onClick={handleSync} disabled={loading} className="syncBtn">
              <MdSync />
              {loading ? "Syncing..." : "Sync"}
            </button>
          )}
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
