export default function About() {
  return (
    <div className="max-w-xl mx-auto mt-12">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-white mb-4">About</h2>
        <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
          <p>
            Ping Postman Pong SF is the official table tennis leaderboard for Postman's San Francisco office.
            Players are ranked using an ELO rating system — win against higher-ranked opponents to climb faster.
          </p>
          <p>
            Games are played to <span className="text-white font-medium">11</span> or <span className="text-white font-medium">21</span> points.
          </p>
          <p>
            To submit a score, send your match result to <span className="text-white font-medium">Nihar</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
