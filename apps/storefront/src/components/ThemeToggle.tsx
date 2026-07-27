import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check initial theme from document element or localStorage
    const currentTheme =
      (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
      (document.documentElement.classList.contains("dark") ? "dark" : "dark");
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // ignore quota / access errors
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-elevated)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-gold)] hover:text-[var(--color-accent-gold)] hover:bg-[var(--color-bg-surface)] shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]"
    >
      {theme === "dark" ? (
        // Sun Icon (Switch to Light)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-[var(--color-accent-gold)] transition-transform duration-300 rotate-0 hover:rotate-45"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon Icon (Switch to Dark)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-[var(--color-accent-emerald)] transition-transform duration-300 -rotate-12 hover:rotate-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
