// ─────────────────────────────────────────────────────────────
// GitHub Activity Monitor — Follower Watcher
// ─────────────────────────────────────────────────────────────

import type {
  GitHubFollower,
  FollowerActivityReport,
  FollowerSnapshot,
} from "./types.js";

const GITHUB_API_BASE = "https://api.github.com";

// ─── Internal helpers ─────────────────────────────────────────

/**
 * Fetch the full follower list for `username` from the GitHub REST API,
 * automatically paginating until all followers have been retrieved.
 */
async function fetchAllFollowers(
  username: string,
  token?: string
): Promise<GitHubFollower[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const followers: GitHubFollower[] = [];
  let page = 1;

  while (true) {
    const url =
      `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/followers` +
      `?per_page=100&page=${page}`;

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(
        `GitHub API error ${response.status}: ${response.statusText}`
      );
    }

    const data = (await response.json()) as Array<{
      login: string;
      id: number;
      avatar_url: string;
      html_url: string;
    }>;

    if (data.length === 0) break;

    for (const u of data) {
      followers.push({
        login: u.login,
        id: u.id,
        avatarUrl: u.avatar_url,
        htmlUrl: u.html_url,
      });
    }

    if (data.length < 100) break;
    page++;
  }

  return followers;
}

/**
 * Compute a `FollowerActivityReport` by diffing two consecutive snapshots.
 */
function diffSnapshots(
  previous: FollowerSnapshot,
  current: FollowerSnapshot
): FollowerActivityReport {
  const prevIds = new Set(previous.followers.map((f) => f.id));
  const currIds = new Set(current.followers.map((f) => f.id));

  const newFollowers = current.followers.filter((f) => !prevIds.has(f.id));
  const lostFollowers = previous.followers.filter((f) => !currIds.has(f.id));
  const delta = current.followers.length - previous.followers.length;

  let summary: string;
  if (newFollowers.length === 0 && lostFollowers.length === 0) {
    summary = "沒有新的追蹤者動態。";
  } else {
    const parts: string[] = [];
    if (newFollowers.length > 0) {
      const names = newFollowers.map((f) => f.login).join("、");
      parts.push(`新增了 ${newFollowers.length} 位追蹤者：${names}`);
    }
    if (lostFollowers.length > 0) {
      const names = lostFollowers.map((f) => f.login).join("、");
      parts.push(`減少了 ${lostFollowers.length} 位追蹤者：${names}`);
    }
    summary = parts.join("；") + "。";
  }

  return {
    entityId: current.entityId,
    checkedAt: current.timestamp,
    previousCount: previous.followers.length,
    currentCount: current.followers.length,
    delta,
    newFollowers,
    lostFollowers,
    summary,
  };
}

// ─── FollowerWatcher ──────────────────────────────────────────

/**
 * FollowerWatcher monitors GitHub follower changes for a given user.
 *
 * It maintains an in-memory baseline snapshot and compares it against
 * freshly fetched data from the GitHub API each time `check()` is called.
 *
 * Example
 * ```ts
 * const watcher = new FollowerWatcher("YiChunLinlifeguidebook");
 * await watcher.init();
 *
 * // … some time later …
 * const report = await watcher.check();
 * console.log(report.summary);
 * // e.g. "新增了 2 位追蹤者：alice、bob。"
 * ```
 */
export class FollowerWatcher {
  private baseline: FollowerSnapshot | null = null;

  /**
   * @param username  GitHub username to monitor.
   * @param token     Optional GitHub personal-access token.
   *                  Providing one raises the API rate limit from 60 to
   *                  5,000 requests per hour.
   */
  constructor(
    private readonly username: string,
    private readonly token?: string
  ) {}

  /**
   * Capture the current follower list as the baseline snapshot.
   * Must be called once before `check()`.
   */
  async init(): Promise<void> {
    const followers = await fetchAllFollowers(this.username, this.token);
    this.baseline = {
      entityId: this.username,
      timestamp: new Date().toISOString(),
      followers,
    };
  }

  /**
   * Fetch the current follower list, compare it against the stored baseline,
   * and return a `FollowerActivityReport` describing any changes.
   *
   * The baseline is automatically advanced to the current snapshot so that
   * consecutive calls report only incremental changes.
   *
   * @throws if `init()` has not been called first.
   */
  async check(): Promise<FollowerActivityReport> {
    if (!this.baseline) {
      throw new Error(
        "FollowerWatcher has not been initialised — call init() first."
      );
    }

    const followers = await fetchAllFollowers(this.username, this.token);
    const current: FollowerSnapshot = {
      entityId: this.username,
      timestamp: new Date().toISOString(),
      followers,
    };

    const report = diffSnapshots(this.baseline, current);

    // Advance the baseline so the next call reports only new changes.
    this.baseline = current;

    return report;
  }

  /**
   * Reset the baseline to the current follower list without producing a
   * report.  Useful after an extended pause to avoid surfacing stale diffs.
   */
  async reset(): Promise<void> {
    await this.init();
  }
}
