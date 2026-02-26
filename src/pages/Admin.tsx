import { useState } from "react";
import { useData } from "../DataContext";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export default function Admin() {
  const { data, loading, addPlayer, recordMatch, deletePlayer, deleteMatch } = useData();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);

  const [newPlayerName, setNewPlayerName] = useState("");
  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      await addPlayer(newPlayerName);
      setNewPlayerName("");
      setMessage({ type: "success", text: `Added ${newPlayerName.trim()}!` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to add player" });
    } finally {
      setSaving(false);
    }
  }

  async function handleRecordMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!player1Id || !player2Id || player1Id === player2Id) return;
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0 || s1 === s2) return;
    const winScore = Math.max(s1, s2);
    if (winScore !== 11 && winScore !== 21) return;

    setSaving(true);
    setMessage(null);
    try {
      await recordMatch(player1Id, player2Id, s1, s2);
      setScore1("");
      setScore2("");
      setMessage({ type: "success", text: "Match recorded!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to record match" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePlayer(id: string, name: string) {
    if (!confirm(`Delete ${name}? This also removes all their matches.`)) return;
    setSaving(true);
    try {
      await deletePlayer(id);
      setMessage({ type: "success", text: `Deleted ${name}` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMatch(id: string) {
    if (!confirm("Delete this match? ELO changes will be reversed.")) return;
    setSaving(true);
    try {
      await deleteMatch(id);
      setMessage({ type: "success", text: "Match deleted and ELO reversed" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete" });
    } finally {
      setSaving(false);
    }
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-1 text-center">Admin Access</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Enter the admin password to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-postman focus:ring-1 focus:ring-postman transition-colors"
              autoFocus
            />
            {authError && (
              <p className="text-red-400 text-sm">Incorrect password</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-postman hover:bg-postman-dark text-white font-semibold rounded-lg transition-colors"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-postman border-t-transparent rounded-full" />
      </div>
    );
  }

  const playerMap = new Map(data.players.map((p) => [p.id, p.name]));
  const sortedPlayers = [...data.players].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Admin Panel</h2>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add Player */}
      <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Add Player</h3>
        <form onSubmit={handleAddPlayer} className="flex gap-3">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Player name"
            className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-postman focus:ring-1 focus:ring-postman transition-colors"
            disabled={saving}
          />
          <button
            type="submit"
            disabled={saving || !newPlayerName.trim()}
            className="px-6 py-2.5 bg-postman hover:bg-postman-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Add
          </button>
        </form>
      </section>

      {/* Record Match */}
      <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Record Match</h3>
        <form onSubmit={handleRecordMatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Player 1</label>
              <select
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-postman focus:ring-1 focus:ring-postman transition-colors"
                disabled={saving}
              >
                <option value="">Select player</option>
                {sortedPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Player 2</label>
              <select
                value={player2Id}
                onChange={(e) => setPlayer2Id(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-postman focus:ring-1 focus:ring-postman transition-colors"
                disabled={saving}
              >
                <option value="">Select player</option>
                {sortedPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Score 1</label>
              <input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => { const v = e.target.value; if (v === "" || (Number(v) >= 0 && Number.isInteger(Number(v)))) setScore1(v); }}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-postman focus:ring-1 focus:ring-postman transition-colors"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Score 2</label>
              <input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => { const v = e.target.value; if (v === "" || (Number(v) >= 0 && Number.isInteger(Number(v)))) setScore2(v); }}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-postman focus:ring-1 focus:ring-postman transition-colors"
                disabled={saving}
              />
            </div>
          </div>
          {player1Id && player2Id && player1Id === player2Id && (
            <p className="text-red-400 text-sm">Players must be different</p>
          )}
          {score1 && score2 && score1 === score2 && (
            <p className="text-red-400 text-sm">Scores can't be tied</p>
          )}
          {score1 && score2 && score1 !== score2 && Math.max(Number(score1), Number(score2)) !== 11 && Math.max(Number(score1), Number(score2)) !== 21 && (
            <p className="text-red-400 text-sm">Winning score must be 11 or 21</p>
          )}
          <button
            type="submit"
            disabled={
              saving ||
              !player1Id ||
              !player2Id ||
              player1Id === player2Id ||
              !score1 ||
              !score2 ||
              score1 === score2
            }
            className="w-full py-2.5 bg-postman hover:bg-postman-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {saving ? "Saving..." : "Record Match"}
          </button>
        </form>
      </section>

      {/* Manage Players */}
      <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Manage Players</h3>
        {data.players.length === 0 ? (
          <p className="text-slate-400 text-sm">No players yet.</p>
        ) : (
          <div className="space-y-2">
            {sortedPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-4 py-2.5 bg-slate-900/30 rounded-lg"
              >
                <div>
                  <span className="text-white font-medium">{p.name}</span>
                  <span className="text-slate-400 text-sm ml-3">
                    ELO: {Math.round(p.elo)} | {p.wins}W {p.losses}L
                  </span>
                </div>
                <button
                  onClick={() => handleDeletePlayer(p.id, p.name)}
                  disabled={saving}
                  className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Matches (with delete) */}
      <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Matches</h3>
        {data.matches.length === 0 ? (
          <p className="text-slate-400 text-sm">No matches yet.</p>
        ) : (
          <div className="space-y-2">
            {data.matches.slice(0, 20).map((m) => {
              const p1Name = playerMap.get(m.player1Id) ?? "Unknown";
              const p2Name = playerMap.get(m.player2Id) ?? "Unknown";
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-4 py-2.5 bg-slate-900/30 rounded-lg"
                >
                  <div className="text-sm">
                    <span className="text-white font-medium">{p1Name}</span>
                    <span className="text-slate-400 mx-2">
                      {m.player1Score} - {m.player2Score}
                    </span>
                    <span className="text-white font-medium">{p2Name}</span>
                    <span className="text-slate-500 ml-3 text-xs">
                      {new Date(m.date).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteMatch(m.id)}
                    disabled={saving}
                    className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
