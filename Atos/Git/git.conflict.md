# Git Conflicts: When They Occur and How to Abort

A conflict happens when Git cannot automatically combine changes because the same part of the same file was modified differently on both sides of an integration. Git stops the operation and marks the file with conflict markers:

```
<<<<<<< HEAD
your version
=======
their version
>>>>>>> branch-name
```

You must edit the file, choose the correct result, remove the markers, then continue or abort.

Conflicts apply to **file content**, not just branch pointers. They arise during operations that try to **apply or combine commits**.

---

## When Conflicts Can Occur

| Operation | When it conflicts |
|---|---|
| **`git merge`** | Merging another branch into your current branch; both changed the same lines since the common ancestor. |
| **`git pull`** (default) | Same as merge — pull fetches, then merges. Conflicts if your local commits and remote commits touch the same lines. |
| **`git pull --rebase`** | Same as rebase — conflicts can happen **once per replayed commit**. |
| **`git rebase`** | Replaying your commits onto a new base; a later upstream change conflicts with one of your commits. |
| **`git cherry-pick`** | Applying a single commit from another branch; its changes don't apply cleanly to your current branch. |
| **`git revert`** | Reverting a commit whose changes conflict with the current state of the tree. |
| **`git stash pop` / `git stash apply`** | Stashed changes overlap with changes made after the stash was created. |
| **`git am`** | Applying patches from email; patch doesn't apply cleanly. |

### Common real-world scenarios

1. **Pulling while you have local commits** — you and a teammate edited the same function.
2. **Rebasing a feature branch onto updated `main`** — `main` changed a file you also changed.
3. **Merging a PR** — feature branch and target branch diverged on the same lines.
4. **Cherry-picking a fix** — the fix was written against a different base than your branch.
5. **Stash pop after editing the same file** — work done after stashing conflicts with the stash.

### When conflicts do **not** occur

- **`git fetch`** — only downloads objects; does not modify your working branch.
- **Fast-forward merge / pull** — your branch has no unique commits; Git just moves the pointer forward.
- **Changes to different files** — usually merges cleanly.
- **Changes to different parts of the same file** — Git often auto-merges successfully.

---

## Merge vs Rebase: How Conflicts Differ

**Merge** — Git combines both histories in one step. You typically resolve **all conflicts once**, then finish the merge.

**Rebase** — Git replays commits one at a time. You may need to resolve conflicts **multiple times** (once per conflicting commit).

```
merge:   combine E+F+G with D in one step  →  resolve once

rebase:  replay E, then F, then G onto D   →  resolve per commit
```

---

## How to Abort

Abort cancels the in-progress operation and restores your branch to the state it was in **before the operation started** (when Git supports abort for that operation).

### Merge

```bash
git merge --abort
```

Use when a merge is in progress (including a merge started by `git pull` without `--rebase`).

Also works as:

```bash
git reset --merge
```

### Rebase

```bash
git rebase --abort
```

Use when a rebase is in progress (including one started by `git pull --rebase`).

### Cherry-pick

```bash
git cherry-pick --abort
```

### Revert (when stopped on conflicts)

```bash
git revert --abort
```

### Stash apply / pop

There is **no** `git stash --abort`. If `stash pop` conflicts:

```bash
# discard the failed apply and keep the stash
git reset --hard

# or resolve conflicts, then:
git add <resolved-files>
# stash is already dropped after pop; finish manually
```

For `git stash apply` (stash is kept), you can `git reset --hard` to undo the partial apply.

### Patch apply (`git am`)

```bash
git am --abort
```

---

## Abort vs Continue vs Skip

| Command | Effect |
|---|---|
| **`--abort`** | Cancel everything; return to pre-operation state. |
| **`--continue`** | After resolving conflicts and `git add`, resume the operation. |
| **`--skip`** (rebase/cherry-pick only) | Drop the current commit and move on. |

Example after resolving conflicts:

```bash
git add <resolved-files>
git merge --continue      # or git commit if merge already staged
git rebase --continue
git cherry-pick --continue
```

---

## How to Tell What's In Progress

```bash
git status
```

Git will say something like:

- `You have unmerged paths` → merge in progress
- `interactive rebase in progress` → rebase in progress
- `You are currently cherry-picking` → cherry-pick in progress

The presence of `.git/MERGE_HEAD`, `.git/REBASE_HEAD`, or `.git/CHERRY_PICK_HEAD` also indicates which operation is active.

---

## Important Caveats

1. **Abort only works while the operation is in progress.** Once you complete a merge or rebase with `git commit` or `git rebase --continue` through the last commit, you cannot `--abort` — you must use `git reset`, `git revert`, or `git reflog` to undo.
2. **`git pull --abort` does not exist.** Abort the underlying operation: `git merge --abort` or `git rebase --abort`.
3. **Uncommitted work** — abort restores branch state but does not always discard edits in your working tree from before the operation. Run `git status` after aborting.
4. **Conflicts during `rebase -i`** — still use `git rebase --abort` to cancel the whole rebase.

---

## Mental Model

A conflict means Git found **overlapping edits** and refused to guess which version you want. You have three choices:

- **Resolve and continue** — edit files, `git add`, then `--continue` or commit.
- **Abort** — cancel the whole operation and go back to the starting point.
- **Skip** (rebase/cherry-pick only) — drop the problematic commit and keep going.

When in doubt, `git status` tells you which operation is active and which abort command applies.

---

## Quick Reference

```bash
git merge --abort
git rebase --abort
git cherry-pick --abort
git revert --abort
git am --abort

git status                    # see what's in progress
git reflog                    # recover if you completed then regretted it
```
