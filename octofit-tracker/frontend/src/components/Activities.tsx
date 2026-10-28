import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  return (
    <CapabilityCard<{ activities: Activity[] }>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      emptyText="No activities yet."
      isEmpty={({ activities }) => activities.length === 0}
      render={({ activities }) => (
        <ul className="list-unstyled mb-0">
          {activities.map((activity, index) => (
            <li key={`${activity.type}-${index}`}>{activity.type}: {activity.minutes} minutes, {activity.points} points</li>
          ))}
        </ul>
      )}
    />
  );
}
