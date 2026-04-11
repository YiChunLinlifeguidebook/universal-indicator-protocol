// ─────────────────────────────────────────────────────────────
// GitHub Activity Monitor — Types
// ─────────────────────────────────────────────────────────────

/** A GitHub user who follows the monitored account. */
export type GitHubFollower = {
  /** GitHub login / username. */
  login: string;
  /** GitHub numeric user ID. */
  id: number;
  /** URL to the user's avatar image. */
  avatarUrl: string;
  /** URL to the user's GitHub profile page. */
  htmlUrl: string;
};

/** A point-in-time snapshot of a user's GitHub follower list. */
export type FollowerSnapshot = {
  /** The GitHub username being monitored. */
  entityId: string;
  /** ISO-8601 timestamp when the snapshot was taken. */
  timestamp: string;
  /** Full list of followers recorded at this moment. */
  followers: GitHubFollower[];
};

/** The result of comparing two consecutive follower snapshots. */
export type FollowerActivityReport = {
  /** The GitHub username being monitored. */
  entityId: string;
  /** ISO-8601 timestamp when the comparison was performed. */
  checkedAt: string;
  /** Follower count recorded in the previous snapshot. */
  previousCount: number;
  /** Follower count recorded in the current snapshot. */
  currentCount: number;
  /** Net change — positive means gained followers, negative means lost. */
  delta: number;
  /** Followers that appeared since the last snapshot. */
  newFollowers: GitHubFollower[];
  /** Followers that disappeared since the last snapshot. */
  lostFollowers: GitHubFollower[];
  /** Human-readable summary of the activity. */
  summary: string;
};
