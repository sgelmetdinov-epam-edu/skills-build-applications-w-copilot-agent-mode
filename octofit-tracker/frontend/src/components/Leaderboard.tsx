import { CapabilityCard } from './CapabilityCard.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard<{ leaderboard: Ranking[] }>
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      emptyText="No rankings yet."
      isEmpty={({ leaderboard }) => leaderboard.length === 0}
      render={({ leaderboard }) => (
        <ol className="mb-0">
          {leaderboard.map((entry) => (
            <li key={entry.teamName}>{entry.teamName}: {entry.totalPoints} points</li>
          ))}
        </ol>
      )}
    />
  );
}
