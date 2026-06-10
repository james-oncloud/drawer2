The normal **git rebase** flow is: update `main`, rebase your feature branch onto it, fix any conflicts, then push (often with `--force-with-lease` if the branch was already on the remote).

## Typical flow (feature branch onto `main`)

```bash
# 1. Save your work on feature
git checkout feature
git add .
git commit -m "my change"

# 2. Get latest main
git fetch origin
git checkout main
git pull origin main

# 3. Rebase feature onto updated main
git checkout feature
git rebase main
# or in one step from any branch:
# git rebase main feature

# 4. If conflicts happen
# edit files, remove conflict markers
git add <resolved-files>
git rebase --continue
# repeat until done

# 5. Push feature
git push --force-with-lease origin feature
```

Use `--force-with-lease` only if the branch was already pushed — rebase rewrites commit hashes.

---

## What each step does

| Step | Purpose |
|---|---|
| Commit on `feature` | Your work is saved before history is rewritten |
| Update `main` | Rebase onto the latest base, not stale `main` |
| `git rebase main` | Replay feature commits on top of `main` |
| Resolve conflicts | Fix overlaps one commit at a time |
| Force-push | Update remote feature branch after rewrite |

---

## Visual flow

```
Before:
main:    A --- B --- C --- D
              \
feature:       E --- F --- G

After git rebase main:
main:    A --- B --- C --- D
                              \
feature:                       E' --- F' --- G'
```

`main` stays the same. `feature` moves on top of `main`.

---

## Shorter variant (very common)

If you already have latest `main` locally:

```bash
git checkout feature
git fetch origin
git rebase origin/main
git push --force-with-lease origin feature
```

Many teams rebase directly onto `origin/main` so you don't need to checkout `main` first.

---

## During conflicts

```bash
# fix file(s)
git add file1.txt
git rebase --continue

# or bail out
git rebase --abort
```

Do **not** run `git commit` during rebase — `git add` then `git rebase --continue`.

---

## When to use this flow

Use rebase when:

- You're on a **local or personal feature branch**
- You want a **clean, linear history**
- You're **updating your branch** with latest `main` before a PR

Avoid rebasing commits others have already pulled from a shared branch unless the team agrees.

---

## After rebase: getting into `main`

Rebase does **not** merge into `main`. After rebase, you usually:

```bash
# open a PR: feature → main
# or locally:
git checkout main
git merge feature
git push origin main
```

---

## Golden rule

**Rebase the branch you're working on, onto the branch you want to be based on.**

```bash
git checkout feature
git rebase main
```

That means: "Replay my feature work on top of the latest `main`."

---

## Quick reference

```bash
git checkout feature
git rebase main
git rebase --continue
git rebase --abort
git push --force-with-lease origin feature
```

If you want, I can also outline the **interactive rebase** flow (`git rebase -i`) for squashing commits before a PR.