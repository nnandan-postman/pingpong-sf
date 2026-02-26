import { Routes, Route, NavLink, Link } from "react-router-dom";
import Leaderboard from "./pages/Leaderboard";
import GameHistory from "./pages/GameHistory";
import Admin from "./pages/Admin";

const navItems = [
  { to: "/", label: "Leaderboard" },
  { to: "/games", label: "Games" },
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🏓</span>
            <h1 className="text-lg font-extrabold text-gradient leading-tight">
              Ping Postman Pong SF
            </h1>
          </Link>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-postman/15 text-postman"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/games" element={<GameHistory />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-6 text-center text-xs text-slate-500">
        Ping Postman Pong SF — ELO-based table tennis rankings
      </footer>
    </div>
  );
}
