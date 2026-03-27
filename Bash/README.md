# Bash syntax reference

This folder contains **`bash-syntax-reference.sh`**, a single script you can use as an in-repo cheat sheet for Bash syntax. It is executable and should pass `bash -n`.

## What it covers

- Shebang options, `set` / `shopt` (commented examples)
- Comments, including a here-document style block comment
- Quoting, scalars, `readonly`, `declare -i` / `-a`, and associative arrays (Bash 4+ where needed)
- Special parameters (`$#`, `$?`, `$!`, etc.)
- Parameter expansion (substring, trim, replace, `:-` / `:=` / `:+`, arrays)
- Command substitution, arithmetic `(( ))` / `$(( ))`
- `[ ]`, `[[ ]]`, `(( ))`, `case`
- `for` / `for (( ))` / `while` / `until`
- Functions, nameref on Bash 4.3+ with a fallback for older Bash
- `shift`, `getopts` (with a small demo via `--demo`)
- Redirections, here-doc / here-string, pipelines, process substitution (commented)
- Subshell `()` vs grouping `{}`
- `trap`
- `command`, `type`, `printf -v`, `read -a`, reading a file (loop plus `mapfile` on Bash 4+)
- Extra topics in comments (e.g. `export`, `coproc`, array slices, `jobs` / `disown`)

The script targets **Bash 3.2+** (e.g. macOS `/bin/bash`) so it runs without errors; newer-only features are guarded or shown in comments.

## Usage

From this directory:

```bash
bash bash-syntax-reference.sh
```

Shows a short message. To run the small demos (positional parameters and `getopts`):

```bash
bash bash-syntax-reference.sh --demo
```

To load the script into your current shell without running `main` (definitions only; the script is written so sourcing is safe for that purpose):

```bash
source bash-syntax-reference.sh
```

If the executable bit is set, you can also run:

```bash
./bash-syntax-reference.sh
./bash-syntax-reference.sh --demo
```

## Note

A single file cannot list every Bash feature (every `shopt`, sparse arrays, all trap nuances, etc.); the script balances breadth with readability. Extend it with more commented blocks if you need deeper coverage.
