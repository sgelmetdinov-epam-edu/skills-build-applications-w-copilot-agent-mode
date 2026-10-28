import { Activity, Team, User, Workout } from '../models/index.js';

type HttpError = Error & { status: number };

function httpError(message: string, status: number): HttpError {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw httpError('Activity details are required', 400);
  const { userId, teamId, type, minutes } = input;
  if (!isObjectId(userId) || !isObjectId(teamId)) throw httpError('Valid userId and teamId are required', 400);
  if (typeof type !== 'string' || !type.trim()) throw httpError('Activity type is required', 400);
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError('Activity minutes must be a positive number', 400);
  }

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) throw httpError('The referenced user or team does not exist', 404);

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw httpError('Team details are required', 400);
  const { name, mascot, members } = input;
  if (typeof name !== 'string' || !name.trim()) throw httpError('Team name is required', 400);
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError('Team mascot is required', 400);

  if (members !== undefined && (!Array.isArray(members) || !members.every(isObjectId))) {
    throw httpError('Team members must be valid user IDs', 400);
  }
  const memberIds = (members ?? []) as string[];
  if (memberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== new Set(memberIds).size) throw httpError('A referenced team member does not exist', 404);
  }

  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate([{ $group: { _id: '$team', totalPoints: { $sum: '$points' } } }]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [String(_id), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(String(team._id)) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError('User not found', 404);

  const [workouts, recentActivities] = await Promise.all([
    Workout.find().lean(),
    Activity.find({ user: user._id }).sort({ occurredAt: -1, _id: -1 }).limit(1).lean(),
  ]);
  const recentActivity = recentActivities[0];
  const activityFocus = recentActivity
    ? ['run', 'cycle', 'walk', 'swim', 'cardio'].includes(recentActivity.type.toLowerCase())
      ? 'endurance'
      : recentActivity.type.toLowerCase()
    : undefined;
  const preferredFocus = workouts.some((workout) => workout.focus === user.fitnessGoal)
    ? user.fitnessGoal
    : activityFocus && workouts.some((workout) => workout.focus === activityFocus)
      ? activityFocus
      : undefined;

  return workouts
    .sort((left, right) => Number(right.focus === preferredFocus) - Number(left.focus === preferredFocus)
      || left.title.localeCompare(right.title))
    .map((workout) => ({
      ...workout,
      reason: workout.focus === user.fitnessGoal
        ? `Recommended for your ${user.fitnessGoal} goal.`
        : workout.focus === activityFocus && recentActivity
          ? `Recommended based on your recent ${recentActivity.type} activity.`
          : `A ${workout.focus} option for your next workout.`,
    }));
}

export { User };
