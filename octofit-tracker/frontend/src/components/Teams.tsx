import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot: string; members: string[] };

export default function Teams() {
  return (
    <CapabilityCard<{ teams: Team[] }>
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      emptyText="No teams yet."
      isEmpty={({ teams }) => teams.length === 0}
      render={({ teams }) => (
        <ul className="list-unstyled mb-0">
          {teams.map((team) => (
            <li key={team.name}>{team.name} ({team.mascot}) · {team.members.length} members</li>
          ))}
        </ul>
      )}
    />
  );
}
