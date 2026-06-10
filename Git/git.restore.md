To get **one file** back in Git, the command depends on **where** you want it from.

## 1. Discard local uncommitted changes

Restore the file to the last commit on your current branch:

```bash
git restore file1.txt
```

Older equivalent:

```bash
git checkout -- file1.txt
```

---

## 2. Get a file from another branch

```bash
git restore --source=feature file1.txt
```

Or:

```bash
git checkout feature -- file1.txt
```

That copies `file1.txt` from `feature` into your working tree and stages it.

---

## 3. Get a file from a specific commit

```bash
git restore --source=abc1234 file1.txt
```

Or:

```bash
git checkout abc1234 -- file1.txt
```

Useful when you know the commit SHA from `git log`.

---

## 4. View a file from history (without changing your branch)

```bash
git show abc1234:file1.txt
```

Prints the file contents at that commit. Does not modify your working tree.

Save it to a file:

```bash
git show abc1234:file1.txt > file1.txt.recovered
```

---

## 5. Undo a staged file (keep working copy, unstage)

```bash
git restore --staged file1.txt
```

To unstage **and** discard edits:

```bash
git restore --staged --worktree file1.txt
```

---

## Quick decision guide

| Goal | Command |
|---|---|
| Throw away my edits | `git restore file1.txt` |
| Get file from another branch | `git restore --source=feature file1.txt` |
| Get file from old commit | `git restore --source=abc1234 file1.txt` |
| Just look at old version | `git show abc1234:file1.txt` |

---

## After restoring

If you used `git restore --source=...` or `git checkout <ref> -- file`, the file is usually **staged**. Commit if you want to keep it:

```bash
git add file1.txt
git commit -m "Restore file1.txt from feature"
```

---

**Summary:** `git restore file1.txt` = undo local edits. `git restore --source=<branch-or-commit> file1.txt` = retrieve that file from elsewhere.