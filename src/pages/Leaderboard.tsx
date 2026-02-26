import { useData } from "../DataContext";

function getStreak(playerId: string, matches: { player1Id: string; player2Id: string; player1Score: number; player2Score: number }[]): string {
  let streak = 0;
  let lastResult: "W" | "L" | null = null;

  for (const m of matches) {
    let won: boolean | null = null;
    if (m.player1Id === playerId) won = m.player1Score > m.player2Score;
    else if (m.player2Id === playerId) won = m.player2Score > m.player1Score;
    else continue;

    const result = won ? "W" : "L";
    if (lastResult === null) {
      lastResult = result;
      streak = 1;
    } else if (result === lastResult) {
      streak++;
    } else {
      break;
    }
  }

  if (streak === 0) return "—";
  return `${streak}${lastResult}`;
}

export default function Leaderboard() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-postman border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">
        <p className="text-lg font-semibold">Failed to load data</p>
        <p className="text-sm mt-1 text-slate-400">{error}</p>
      </div>
    );
  }

  if (!data || data.players.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg font-semibold">No players yet</p>
        <p className="text-sm mt-1">Head to the Admin page to add players and start recording matches.</p>
      </div>
    );
  }

  const sorted = [...data.players].sort((a, b) => b.elo - a.elo);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>

      <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
        <table className="w-full">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-4 font-medium">Rank</th>
              <th className="text-left py-3 px-4 font-medium">Player</th>
              <th className="text-right py-3 px-4 font-medium">ELO</th>
              <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">W</th>
              <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">L</th>
              <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">Win %</th>
              <th className="text-right py-3 px-4 font-medium">Streak</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, i) => {
              const total = player.wins + player.losses;
              const winPct = total > 0 ? ((player.wins / total) * 100).toFixed(0) : "—";
              const streak = getStreak(player.id, data.matches);
              return (
                <tr
                  key={player.id}
                  className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-400 font-medium">
                    {i + 1}
                  </td>
                  <td className="py-3 px-4 text-white font-semibold">{player.name}</td>
                  <td className="py-3 px-4 text-right font-bold text-postman">
                    {Math.round(player.elo)}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400 hidden sm:table-cell">
                    {player.wins}
                  </td>
                  <td className="py-3 px-4 text-right text-red-400 hidden sm:table-cell">
                    {player.losses}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300 hidden sm:table-cell">
                    {winPct === "—" ? winPct : `${winPct}%`}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-sm font-medium ${
                        streak.includes("W")
                          ? "text-green-400"
                          : streak.includes("L")
                            ? "text-red-400"
                            : "text-slate-500"
                      }`}
                    >
                      {streak}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
