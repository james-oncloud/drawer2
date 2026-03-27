#!/usr/bin/env bash
#===============================================================================
# bash-syntax-reference.sh — Bash syntax showcase (reference; safe to source)
# Run:  bash bash-syntax-reference.sh [--demo]
# Source: source bash-syntax-reference.sh
# Notes: Targets Bash 3.2+; sections labeled (bash 4+) / (bash 4.3+) need newer Bash.
#===============================================================================

# --- Shebang variants (first line only; shown here as comments) --------------
# #!/bin/bash
# #!/usr/bin/bash
# #!/usr/bin/env bash   # portable when bash is on PATH

# --- Shell options (commonly combined for scripts) ---------------------------
# set -e          # exit on simple command failure (nuances apply)
# set -u          # error on unset variables
# set -o pipefail # pipeline fails if any command fails
# set -x          # trace commands (debug)
# set -E          # inherit ERR trap in functions/subshells (bash)
# set -o noclobber # prevent > from overwriting existing files
# shopt -s nullglob   # unmatched globs expand to nothing
# shopt -s dotglob    # * includes dotfiles
# shopt -s extglob    # extended globs: ?( ) *( ) +( ) @( ) !( )

# This file runs with loose options so all sections execute.
set +e

# --- Comments ----------------------------------------------------------------
# Line comment
: <<'END_BLOCK_COMMENT'
  Multi-line comment via no-op ':' and here-document (quoted delimiter = no expansion).
END_BLOCK_COMMENT

# --- Variables & quoting -------------------------------------------------------
scalar='single-quoted literal; $ and ` are not expanded'
dollar="double: $scalar, $(echo command substitution), ${scalar:0:6}"
readonly CONST_PI=3.14159
declare -i ONLY_INT=42          # integer attribute
declare -a ARR=(one two three)  # indexed array
# declare -A MAP=([a]=1 [b]=2)  # associative array (bash 4+); see block below
if ((BASH_VERSINFO[0] >= 4)); then
  declare -A MAP=([a]=1 [b]=2)
fi

# --- Special parameters ------------------------------------------------------
# $0 script name  $1..$9 positional  ${10}+ need braces
# $# count  $@ all args  $* all args  "$@" preserves words  "$*" joins IFS
# $? last exit status  $$ PID  $! last background PID  $- current shell flags

# --- Parameter expansion (selection) -----------------------------------------
v="abcdef"
: "${v:2:3}"      # substring: bcd (offset 2, length 3)
: "${#v}"         # length: 6
: "${v#a*}"       # remove shortest prefix matching a*
: "${v##a*}"      # remove longest prefix
: "${v%f}"        # remove shortest suffix
: "${v%%f}"       # remove longest suffix
: "${v/a/A}"      # replace first a with A
: "${v//a/A}"     # replace all a with A
: "${unset:-default}"   # default if unset or null
: "${unset:=default}"   # assign default if unset or null
: "${maybe:+set}"       # use alternate if set and non-null
: "${ARR[@]}"           # all array elements
if ((BASH_VERSINFO[0] >= 4)); then
  : "${!MAP[@]}"        # all keys of associative array (bash 4+)
fi

# --- Command substitution ----------------------------------------------------
out=$(printf '%s' "captured")
# legacy backticks `cmd` exist; $(cmd) nests and is preferred

# --- Arithmetic ----------------------------------------------------------------
(( ONLY_INT += 1 ))
sum=$(( ONLY_INT + 2 ))
(( ONLY_INT % 2 == 0 )) && : even || : odd

# --- Conditionals: test [ ], [[ ]], (( )) -------------------------------------
if [ -f "${BASH_SOURCE[0]}" ]; then
  : file exists
fi

if [[ "$v" =~ ^a.*f$ ]]; then
  # regex match uses bash [[ ]] =~ operator
  :
fi

if (( sum > 40 )); then
  # numeric compare uses (( )) arithmetic context
  :
fi

case "$v" in
  a*) echo 'starts with a' ;;
  *f) echo 'ends with f' ;;
  *)  echo 'else' ;;
esac

# --- Loops ---------------------------------------------------------------------
for i in 1 2 3; do echo "$i"; done
for (( j = 0; j < 3; j++ )); do :; done
while false; do :; done
until true; do :; done
# select name in a b; do break; done  # interactive menu (omit in non-tty ref)

# --- Functions -----------------------------------------------------------------
function ref_local() {
  local x=1
  # nameref (bash 4.3+): local -n ref="$1"; ref=2
  if ((BASH_VERSINFO[0] >= 5)) || { ((BASH_VERSINFO[0] == 4)) && ((BASH_VERSINFO[1] >= 3)); }; then
    local -n ref="$1"
    ref=2
  else
    eval "$1=2"
  fi
}
y=0
ref_local y

ref_ret() {
  return 1  # 0–255; use for small integers / status only
}

# --- Positional parameters & shift ---------------------------------------------
demo_positional() {
  echo "first: ${1-}"
  shift 2 2>/dev/null || true
  echo "after shift: ${1-}"
}

# --- getopts (simple option parsing) -------------------------------------------
parse_demo() {
  while getopts ":ab:o:" opt; do
    case "$opt" in
      a) echo "option -a" ;;
      b) echo "option -b with $OPTARG" ;;
      o) echo "option -o with $OPTARG" ;;
      :) echo "missing arg for -$OPTARG" >&2 ;;
      \?) echo "invalid -$OPTARG" >&2 ;;
    esac
  done
  shift $((OPTIND - 1))
  echo "remaining: $*"
}

# --- Redirections --------------------------------------------------------------
# cmd >file    cmd >>file    cmd <file    cmd &>file    cmd &>>file
# cmd >|file   # force overwrite with noclobber
# exec {fd}>file  # open file descriptor (bash)

# --- Here-documents & here-strings --------------------------------------------
read -r line <<EOF
one line from here-doc
EOF
read -r line <<<"here-string"

# --- Pipelines & process substitution ------------------------------------------
printf '%s\n' a b | wc -l | cat
# diff <(printf 'a\n') <(printf 'b\n')  # compare process outputs
# readarray lines < <(printf 'x\ny\n')

# --- Subshell vs grouping ------------------------------------------------------
( cd /tmp && pwd ) >/dev/null  # subshell; cwd unchanged in parent
{ echo grouped; echo commands; } > /dev/null  # same shell

# --- Background & jobs ---------------------------------------------------------
# sleep 1 &  wait $!  # wait for last bg job

# --- trap ----------------------------------------------------------------------
cleanup() { echo "trap fired"; }
trap cleanup EXIT
trap 'echo INT' INT
# trap - EXIT  # remove EXIT trap

# --- Miscellaneous -------------------------------------------------------------
command -v bash >/dev/null && : bash found
type -t printf                    # builtin / file / keyword
printf -v VAR '%d' 7              # assign printf output to VAR
read -r -a parts <<< "a b c"     # split into array
# mapfile -t lines < file   # read file into array (bash 4+); portable fallback:
lines=()
while IFS= read -r _line || [[ -n "${_line}" ]]; do lines+=("$_line"); done < "${BASH_SOURCE[0]}"
if ((BASH_VERSINFO[0] >= 4)); then
  mapfile -t _maplines < "${BASH_SOURCE[0]}"
  :
fi

# --- More syntax (commented; enable to try) ------------------------------------
# export VAR=value    readonly VAR    unset VAR
# break [n]  continue [n]   exit [n]   return [n]
# time sleep 0        # time a pipeline or compound command
# coproc NAME { sleep 1; }   # async coprocess (bash 4+); read/write via NAME
# ${ARR[@]:1:2}       # array slice from index 1, length 2
# ${!ARR[@]}          # indices of indexed array
# $RANDOM             # 0–32767 (pseudo-random; reseed carefully for crypto)
# enable -a           # list shell builtins; enable/disable builtins
# builtin cd /tmp     # call builtin explicitly
# suspend             # stop shell until SIGCONT (login shells)
# disown -h %1        # remove job from table; -h mark not to receive SIGHUP
# jobs -l             # list background jobs

# --- Pattern matching (pathname expansion) -------------------------------------
shopt -s nullglob
for f in /nonexistent/path/*.txt; do
  :  # loop skipped if nullglob and no matches
done
shopt -u nullglob

#===============================================================================
# Optional: run demonstrations
#===============================================================================
main() {
  case "${1-}" in
    --demo)
      echo "--- demo_positional ---"
      demo_positional first second third
      echo "--- parse_demo -ab value -o other rest ---"
      parse_demo -ab value -o other -- rest
      ;;
    --help|-h)
      echo "Usage: $0 [--demo]"
      ;;
    *)
      echo "Bash syntax reference loaded. Sections are commented in-source."
      echo "Run with --demo for small examples, or: source $0"
      ;;
  esac
}

# Run main only when executed, not when sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
