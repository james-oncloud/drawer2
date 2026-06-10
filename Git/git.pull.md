# Git Pull, Merge, and Rebase Compared

`git pull`, `git merge`, and `git rebase` are three related ways to bring changes from one branch into another. They are not interchangeable alternatives for the same job — **pull** is a convenience command that combines **fetch** with either **merge** or **rebase**.

---

## How They Relate

```
git pull  =  git fetch  +  integrate (merge OR rebase)
```

| Command | What it does |
|---|---|
| `git fetch` | Downloads new commits from a remote. Does **not** change your working branch. |
| `git merge` | Combines two branch histories by creating a merge commit (or fast-forwarding). |
| `git rebase` | Replays your commits on top of another branch, producing linear history. |
| `git pull` | Fetches from remote, then merges or rebases into your current branch. |

`git pull` does not replace merge or rebase — it **uses** one of them after fetching.

---

## Starting Point: Diverged Branches

You are on `feature`. Your local branch and `origin/feature` have both moved forward:

```
origin/feature:  A --- B --- C --- X --- Y
                              \
local feature:                 D --- E
```

You have local commits (`D`, `E`) that are not on the remote. The remote has commits (`X`, `Y`) you do not have locally.

---

## git pull (default: merge)

```bash
git pull origin feature
# equivalent to:
git fetch origin feature
git merge origin/feature
```

Git fetches `X` and `Y`, then **merges** `origin/feature` into your local `feature`. If both sides have unique commits, Git creates a merge commit:

```
local feature:  A --- B --- C --- X --- Y
                              \           \
                               D --- E --- M
```

### Characteristics

- Preserves the exact history of both sides
- Creates a merge commit when histories diverge (unless fast-forward is possible)
- Safe for shared branches; no history rewrite
- Merge commit messages can clutter the log over time

### Fast-forward pull

If you have **no** local commits, pull can fast-forward — no merge commit:

```
Before:  local at C, remote at Y
After:   local at Y  (pointer simply moves forward)
```

---

## git pull --rebase

```bash
git pull --rebase origin feature
# equivalent to:
git fetch origin feature
git rebase origin/feature
```

Git fetches `X` and `Y`, then **rebases** your local commits (`D`, `E`) on top of the updated remote tip:

```
origin/feature:  A --- B --- C --- X --- Y
                                            \
local feature:                               D' --- E'
```

`D'` and `E'` are new commits with the same changes as `D` and `E`, but different parents and hashes.

### Characteristics

- Produces linear history without merge commits
- Rewrites your **local** unpushed commits
- Conflicts are resolved one commit at a time during replay
- Preferred by many teams for feature branches before pushing

### Set rebase as default for pull

```bash
git config pull.rebase true
# or per-branch:
git config branch.feature.rebase true
```

---

## git merge (standalone)

You do not need `git pull` to merge. After fetching manually:

```bash
git fetch origin
git merge origin/main
```

Or merge a local branch into your current branch:

```bash
git checkout main
git merge feature
```

Merge is the integration strategy used when completing work — for example, merging a pull request into `main`. It records that two lines of development joined at a specific point.

### When merge is the right choice

- Integrating a completed feature into a shared branch (`main`, `develop`)
- The branch has already been pushed and others may have based work on it
- You want to preserve the exact timeline of parallel development
- You need a clear record of *when* branches were combined

---

## git rebase (standalone)

Rebase without pull:

```bash
git fetch origin
git rebase origin/main
```

Or rebase onto another local branch:

```bash
git checkout feature
git rebase main
```

Rebase is primarily a **history-editing** tool. Use it to update a local feature branch with the latest `main`, or to clean up commits before review (`git rebase -i`).

### When rebase is the right choice

- Updating a local feature branch with upstream changes
- Squashing, reordering, or rewording commits before opening a PR
- Keeping feature branch history linear and easy to read

### Golden rule

Do **not** rebase commits that others have already pulled, unless the team coordinates a force-push. Rebasing rewrites history; collaborators with the old commits will have divergent histories.

---

## Side-by-Side Comparison

| | `git pull` (merge) | `git pull --rebase` | `git merge` | `git rebase` |
|---|---|---|---|---|
| Fetches remote changes | Yes | Yes | No (run `fetch` first) | No (run `fetch` first) |
| Integrates changes | Via merge | Via rebase | Yes | Yes |
| History shape | Branched (merge commits) | Linear | Branched | Linear |
| Rewrites local commits | No | Yes (unpushed only) | No | Yes |
| Creates merge commit | Often | No | Often | No |
| Safe on shared/pushed branches | Yes | Only local commits | Yes | Risky without coordination |
| Conflict resolution | Once, at merge | Once per replayed commit | Once, at merge | Once per replayed commit |
| Typical use | Sync with remote | Sync with remote (clean history) | Integrate completed work | Update/clean local branch |

---

## Decision Guide

### Syncing your branch with remote

```
Do you have unpushed local commits?
├── No  →  git pull  (fast-forward; merge or rebase, same result)
└── Yes
    ├── Want linear history, no merge commit?  →  git pull --rebase
    └── Want to preserve exact local timeline?  →  git pull  (merge)
```

### Integrating work into another branch

```
Is the work on a shared branch others have pulled?
├── Yes  →  git merge  (e.g. merge PR into main)
└── No (local feature branch)  →  git rebase onto target, then merge or push
```

### Cleaning up before a pull request

```bash
git fetch origin
git rebase origin/main        # update base
git rebase -i origin/main     # squash, reword, reorder
git push --force-with-lease   # only if branch not shared, or team agrees
```

---

## Conflict Handling

### During merge (or `git pull` without `--rebase`)

Git stops once with all conflicts from the combined diff:

```bash
# fix conflicted files
git add <resolved-files>
git merge --continue   # or just commit if merge already started
```

### During rebase (or `git pull --rebase`)

Git stops at each replayed commit that conflicts:

```bash
# fix conflicted files
git add <resolved-files>
git rebase --continue

# or:
git rebase --abort     # cancel and restore pre-rebase state
git rebase --skip      # drop the current commit
```

---

## Mental Models

- **Fetch** — "Show me what changed remotely, but don't touch my branch yet."
- **Pull** — "Get remote changes and integrate them into my current branch now."
- **Merge** — "These two lines of development happened in parallel; here is where they joined."
- **Rebase** — "Pretend I started my work from the latest point on the other branch."

Pull is the **workflow shortcut**. Merge and rebase are the **integration strategies** pull chooses between.

---

## Quick Reference

```bash
# Pull (fetch + merge)
git pull origin main
git pull --no-rebase origin main    # explicit merge (default in many setups)

# Pull (fetch + rebase)
git pull --rebase origin main

# Manual fetch + integrate
git fetch origin
git merge origin/main
git rebase origin/main

# Merge a feature into main
git checkout main
git merge feature

# Update feature branch onto latest main
git checkout feature
git rebase main

# Defaults
git config pull.rebase true         # prefer rebase on pull
git config pull.rebase false        # prefer merge on pull
git config pull.ff only             # only allow fast-forward pulls
```

---

## Summary

| Concept | One-line summary |
|---|---|
| **git pull** | Fetch remote updates and integrate them into your current branch. |
| **git merge** | Join two histories; preserve both timelines; add a merge commit when needed. |
| **git rebase** | Replay your commits on a new base; linear history; rewrites unpushed commits. |

Use **pull** to stay up to date with a remote branch. Use **merge** to land completed work on shared branches. Use **rebase** to update and polish local feature branches before they are shared.
