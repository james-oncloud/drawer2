# How Git Rebase Works

Git rebase moves or replays commits from one branch onto another. Instead of creating a merge commit that ties two histories together, rebase rewrites your branch so it looks like your work started from the latest commit on the target branch.

---

## The Problem It Solves

When you branch off `main` and both branches advance, your feature branch diverges:

```
main:    A --- B --- C --- D
              \
feature:       E --- F --- G
```

A **merge** preserves both histories and adds a merge commit:

```
main:    A --- B --- C --- D ------- M
              \                   /
feature:       E --- F --- G ----/
```

A **rebase** replays `E`, `F`, and `G` on top of `D`, producing a linear history:

```
main:    A --- B --- C --- D
                              \
feature:                       E' --- F' --- G'
```

`E'`, `F'`, and `G'` are new commits with the same changes as `E`, `F`, and `G`, but different parent commits and usually different commit hashes.

---

## What Happens Under the Hood

When you run `git rebase main` while on `feature`:

1. Git finds the **common ancestor** of `feature` and `main` (commit `B` in the diagram above).
2. It collects the commits on `feature` that are not on `main` (`E`, `F`, `G`).
3. It temporarily removes those commits from `feature` and resets `feature` to point at the tip of `main` (`D`).
4. It replays each collected commit one at a time, applying its patch on top of the current tip.
5. If a replay succeeds, Git creates a new commit and moves the branch pointer forward.
6. When all commits are replayed, `feature` points at `G'`.

Each replayed commit is a **copy** of the original. The originals become unreachable (unless something else still references them, such as reflog entries or another branch).

---

## Common Commands

### Rebase onto another branch

```bash
git checkout feature
git rebase main
```

Replay commits from `feature` onto the tip of `main`.

### Rebase while pulling

```bash
git pull --rebase origin main
```

Fetch remote changes, then replay your local commits on top of the updated remote branch. This avoids a merge commit when your local branch has unpushed commits.

### Interactive rebase

```bash
git rebase -i HEAD~3
```

Opens an editor listing the last three commits. You can:

- **pick** — keep the commit as-is
- **reword** — change the commit message
- **edit** — pause to amend the commit
- **squash** / **fixup** — combine with the previous commit
- **drop** — remove the commit
- **reorder** — change the order of lines to reorder commits

Interactive rebase is the main tool for cleaning up history before opening a pull request.

### Rebase onto a specific commit

```bash
git rebase --onto main topic~3 topic
```

Take commits after `topic~3` up to `topic` and replay them onto `main`. Useful when you want to move a subset of commits to a different base.

---

## Conflicts During Rebase

Rebase applies commits one at a time. If a patch does not apply cleanly, Git stops and asks you to resolve the conflict:

```bash
# Fix conflicted files, then:
git add <resolved-files>
git rebase --continue
```

Other options while paused:

```bash
git rebase --skip      # drop the current commit and move on
git rebase --abort     # cancel the rebase and return to the starting state
```

Because rebase replays commits sequentially, you may need to resolve conflicts multiple times — once per conflicting commit.

---

## Rebase vs Merge

| | Merge | Rebase |
|---|---|---|
| History shape | Branched, with merge commits | Linear |
| Commit hashes | Original commits preserved | New commits created |
| Shared branches | Safe for branches others use | Risky if others have based work on your commits |
| Best for | Integrating completed work on shared branches | Updating a local feature branch; cleaning history before review |

**Golden rule:** Do not rebase commits that have already been pushed to a branch others are using, unless the team explicitly agrees to force-push and coordinate. Rebasing rewrites history; anyone who pulled the old commits will have divergent histories.

---

## The Golden Rule in Practice

Safe:

```bash
# Local feature branch, not yet shared
git checkout feature
git fetch origin
git rebase origin/main
```

Risky without coordination:

```bash
# Rebasing commits already on origin/main
git rebase -i HEAD~5
git push --force-with-lease
```

`--force-with-lease` is safer than `--force` because it refuses to push if the remote branch has new commits you have not seen. Still requires team agreement when rewriting shared history.

---

## Reflog and Recovery

Rebase does not immediately delete old commits. Git keeps them in the **reflog** for a period (default ~90 days):

```bash
git reflog
git reset --hard HEAD@{2}   # return to a state before the rebase
```

If you abort a rebase with `git rebase --abort`, Git restores the branch to where it was when the rebase started.

---

## Mental Model

Think of rebase as: **"Pretend I started my work from here instead."**

- **Merge** says: "These two lines of development happened in parallel; here is where they joined."
- **Rebase** says: "My work always came after yours; let me replay it on your latest state."

Rebase is a history-editing tool. It does not change the content of your work across a branch — it changes *when* and *on what base* each commit appears in the graph.

---

## Quick Reference

```bash
git rebase <upstream>              # replay current branch onto upstream
git rebase -i <base>               # interactive rebase from base
git rebase --continue              # after resolving conflicts
git rebase --abort                 # cancel and restore pre-rebase state
git pull --rebase                  # fetch + rebase instead of merge
git rebase --onto <newbase> <old> <branch>   # transplant a commit range
```

---
# Rebase Location

You should be **on the feature branch**, not on `main`.

```bash
git checkout feature
git rebase main
```

That replays your feature commits on top of the latest `main`.

## Why

`git rebase <upstream>` updates **the branch you are currently on** by replaying its commits onto `<upstream>`.

- On `feature` → `git rebase main` → feature gets updated ✅
- On `main` → `git rebase feature` → **main** gets updated ❌ (opposite of what you want)

## Alternative (without checking out feature)

```bash
git rebase main feature
```

This rebases `feature` onto `main` while leaving your current branch unchanged.

## Typical workflow

```bash
git checkout main
git pull                    # get latest main
git checkout feature
git rebase main             # replay feature on top of updated main
```

**Rule of thumb:** checkout the branch you want to **move/update**, then rebase it onto the branch you want to **base it on**.