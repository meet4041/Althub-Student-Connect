// Build/deploy identification.
//
// At runtime the server should be able to tell you which commit it's actually
// serving. This solves the "I pushed but is it deployed?" problem — instead of
// guessing from behavior, just curl the root or /version endpoint and read the
// SHA. Compare to `git log --oneline -1` locally.
//
// Source priority (first match wins):
//   1. Render's RENDER_GIT_COMMIT env var (set automatically by Render)
//   2. Vercel's VERCEL_GIT_COMMIT_SHA (if ever hosted there)
//   3. GIT_SHA env var (manual override / Docker build arg)
//   4. `git rev-parse HEAD` (works in dev / when .git is present in the deploy)
//
// Computed once at module load — there's no point re-checking on every request,
// the running process can't change its own code.

import { execSync } from "child_process";

const tryGitCommand = (args) => {
  try {
    return execSync(`git ${args}`, {
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 1000,
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
};

const detectGitSha = () => {
  if (process.env.RENDER_GIT_COMMIT) return process.env.RENDER_GIT_COMMIT;
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  if (process.env.GIT_SHA) return process.env.GIT_SHA;
  return tryGitCommand("rev-parse HEAD");
};

const detectGitBranch = () => {
  return (
    process.env.RENDER_GIT_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.GIT_BRANCH ||
    tryGitCommand("rev-parse --abbrev-ref HEAD")
  );
};

const sha = detectGitSha();
const branch = detectGitBranch();
const shortSha = sha ? sha.slice(0, 7) : null;
const startedAt = new Date().toISOString();

export const buildInfo = {
  commit: sha,
  shortCommit: shortSha,
  branch,
  startedAt,
  nodeVersion: process.version,
  env: process.env.NODE_ENV || "development",
};
