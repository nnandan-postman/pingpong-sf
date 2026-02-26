import { useData } from "../DataContext";

export default function GameHistory() {
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

  if (!data || data.matches.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-6xl mb-4">📋</p>
        <p className="text-lg font-semibold">No matches yet</p>
        <p className="text-sm mt-1">Record some matches from the Admin page to see history here.</p>
      </div>
    );
  }

  const playerMap = new Map(data.players.map((p) => [p.id, p.name]));

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Match History</h2>

      <div className="space-y-3">
        {data.matches.map((match) => {
          const p1Name = playerMap.get(match.player1Id) ?? "Unknown";
          const p2Name = playerMap.get(match.player2Id) ?? "Unknown";
          const p1Won = match.player1Score > match.player2Score;
          const date = new Date(match.date);

          return (
            <div
              key={match.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Player 1 */}
                  <div className={`flex-1 text-right ${p1Won ? "text-white" : "text-slate-400"}`}>
                    <span className="font-semibold truncate">{p1Name}</span>
                    {p1Won && <span className="ml-2 text-xs text-green-400">W</span>}
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/50 shrink-0">
                    <span className={`text-lg font-bold ${p1Won ? "text-postman" : "text-slate-400"}`}>
                      {match.player1Score}
                    </span>
                    <span className="text-slate-600">-</span>
                    <span className={`text-lg font-bold ${!p1Won ? "text-postman" : "text-slate-400"}`}>
                      {match.player2Score}
                    </span>
                  </div>

                  {/* Player 2 */}
                  <div className={`flex-1 ${!p1Won ? "text-white" : "text-slate-400"}`}>
                    {!p1Won && <span className="mr-2 text-xs text-green-400">W</span>}
                    <span className="font-semibold truncate">{p2Name}</span>
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>
                  ELO:{" "}
                  <span className={match.player1EloChange >= 0 ? "text-green-400" : "text-red-400"}>
                    {match.player1EloChange >= 0 ? "+" : ""}
                    {match.player1EloChange}
                  </span>
                  {" / "}
                  <span className={match.player2EloChange >= 0 ? "text-green-400" : "text-red-400"}>
                    {match.player2EloChange >= 0 ? "+" : ""}
                    {match.player2EloChange}
                  </span>
                </span>
                <span>
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" "}
                  {date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
