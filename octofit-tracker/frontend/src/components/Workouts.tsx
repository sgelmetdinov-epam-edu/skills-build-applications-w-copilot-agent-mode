import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; focus: string; minutes?: number; reason: string };

export default function Workouts() {
  return (
    <CapabilityCard<{ suggestions: Suggestion[] }>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona%40example.com"
      emptyText="No workout suggestions yet."
      isEmpty={({ suggestions }) => suggestions.length === 0}
      render={({ suggestions }) => (
        <ul className="list-unstyled mb-0">
          {suggestions.map((suggestion) => (
            <li key={suggestion.title}>
              <strong>{suggestion.title}</strong> · {suggestion.focus}
              {suggestion.minutes !== undefined && <> · {suggestion.minutes} minutes</>}
              <p className="mb-0">{suggestion.reason}</p>
            </li>
          ))}
        </ul>
      )}
    />
  );
}
