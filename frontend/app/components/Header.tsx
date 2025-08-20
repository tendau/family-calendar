import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Family Calendar</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
