# How Git Cherry-Pick Works

Git cherry-pick applies the changes from **one specific commit** onto your current branch. Unlike merge or rebase, it does not bring in a whole branch — it copies a single commit's diff and creates a new commit on top of wherever you are now.

---

## The Problem It Solves

Sometimes you need **one fix or feature commit** from another branch, without merging everything on that branch.

```
main:        A --- B --- C --- D
                  \
hotfix:           E --- F --- G   ← only F is the bug fix you need
                  \
feature:           H --- I
```

You want commit `F` on `main`, but not `E` or `G`. Cherry-pick lets you take just `F`.

After `git cherry-pick F` on `main`:

```
main:        A --- B --- C --- D --- F'
                  \
hotfix:           E --- F --- G
                  \
feature:           H --- I
```

`F'` is a **new commit** with the same changes as `F`, but a different parent (`D`) and a different hash.

---

## What Happens Under the Hood

When you run `git cherry-pick <commit>`:

1. Git looks up the commit and computes the **diff** it introduced (changes relative to its parent).
2. Git applies that diff to your **current branch's tip**.
3. If it applies cleanly, Git creates a new commit with those changes.
4. By default, the new commit keeps the **same commit message** as the original (and often the original author/date metadata).

Cherry-pick copies **changes**, not the commit object itself. The new commit is a sibling copy, not a move.

---

## Common Commands

### Cherry-pick a single commit

```bash
git checkout main
git cherry-pick abc1234
```

Apply commit `abc1234` onto `main`.

### Cherry-pick by reference

```bash
git cherry-pick feature~2        # third commit back on feature
git cherry-pick origin/hotfix~1  # specific commit from remote branch
```

### Cherry-pick a range of commits

```bash
git cherry-pick F..G    # commits after F up to and including G (F is excluded)
git cherry-pick F^..G   # commits from F through G (F is included)
```

Cherry-pick applies each commit in the range **one at a time**, in order.

### Cherry-pick without committing immediately

```bash
git cherry-pick -n abc1234    # or --no-commit
```

Stages the changes but does not create a commit. Useful when you want to combine cherry-picked changes with other edits before committing.

### Cherry-pick and edit the message

```bash
git cherry-pick -e abc1234    # or --edit
```

Opens your editor to change the commit message before the new commit is created.

---

## Typical Workflow

### Pull a hotfix onto `main`

```bash
git checkout main
git pull origin main
git cherry-pick <hotfix-commit-sha>
git push origin main
```

### Pull one commit from a colleague's branch

```bash
git fetch origin
git checkout feature
git cherry-pick origin/their-branch~1
```

### Backport a fix to a release branch

```bash
git checkout release-1.2
git cherry-pick abc1234    # fix already merged to main
git push origin release-1.2
```

---

## Conflicts During Cherry-Pick

If the commit's changes don't apply cleanly to your current branch, Git stops and marks conflicts — same as merge/rebase:

```bash
# fix conflicted files, remove conflict markers
git add <resolved-files>
git cherry-pick --continue
```

Other options while paused:

```bash
git cherry-pick --abort     # cancel and restore pre-cherry-pick state
git cherry-pick --skip      # drop this commit and stop (or move on in a range)
```

Do **not** run `git commit` yourself during a cherry-pick conflict — use `git add` then `git cherry-pick --continue`.

---

## Cherry-Pick vs Merge vs Rebase

| | Cherry-pick | Merge | Rebase |
|---|---|---|---|
| What moves | One commit (or a range) | Entire branch | All commits on your branch |
| History shape | Adds isolated commits | Branched, with merge commit | Linear, rewritten |
| Use case | Copy a specific fix/feature | Integrate all work from a branch | Update entire feature branch |
| Original branch | Unchanged | Both branches preserved | Feature branch rewritten |

- **Merge** — "Bring in everything from that branch."
- **Rebase** — "Replay all my commits on a new base."
- **Cherry-pick** — "I only want *that one commit*."

---

## When to Use Cherry-Pick

Good fits:

- Backporting a bug fix to an older release branch
- Pulling one commit from a stalled or abandoned branch
- Applying a specific commit from a PR without merging the whole PR
- Recovering a single commit after a bad rebase or reset (with `git reflog` to find the SHA)

Poor fits:

- Integrating a whole feature branch (use merge or rebase)
- Regularly syncing with `main` (use rebase or merge)
- Replacing code review workflow (prefer proper merge/PR)

---

## Important Caveats

1. **Duplicate commits** — Cherry-picking the same commit twice (or cherry-picking then merging the original branch) can apply the same changes twice and cause conflicts or redundant history.
2. **Context matters** — A commit that applied cleanly on its original branch may conflict on yours because the surrounding code differs.
3. **Empty cherry-pick** — If the changes already exist on your branch, Git may produce an empty commit or skip it:

   ```bash
   git cherry-pick --allow-empty abc1234   # force an empty commit if needed
   ```

4. **Merge commits** — Cherry-picking a merge commit requires `-m` to specify which parent to use:

   ```bash
   git cherry-pick -m 1 <merge-commit>
   ```

   `-m 1` usually means the first parent (the branch that was merged into). This is uncommon in day-to-day work.

5. **Not a history rewrite** — Cherry-pick adds a new commit; it does not move or delete the original.

---

## Mental Model

Think of cherry-pick as: **"Copy this commit's patch and apply it here."**

- **Merge** says: "Join these two lines of development."
- **Rebase** says: "Replay all my work on a new base."
- **Cherry-pick** says: "I just want that one change, right here, right now."

---

## Quick Reference

```bash
git cherry-pick <commit>           # apply one commit
git cherry-pick A..B               # apply a range (A excluded)
git cherry-pick A^..B              # apply a range (A included)
git cherry-pick -n <commit>        # apply without committing
git cherry-pick -e <commit>        # apply and edit message
git cherry-pick --continue         # after resolving conflicts
git cherry-pick --abort            # cancel cherry-pick
git cherry-pick --skip             # skip current commit
git log --oneline --all            # find commit SHAs to pick
```
