#!/usr/bin/env bash
# Link this repo's agent and skill definitions and configuration into the live
# OpenCode config directory, so the tracked copies are the ones OpenCode reads.
#
#   scripts/link-config.sh            # link (backs up anything it replaces)
#   scripts/link-config.sh --check    # report drift without changing anything
#
# Symlinks, not copies: edits are live immediately (agent files hot-reload) and
# the two cannot drift. Never touches service.json, which holds the server
# password, or any *.bak* file.
set -euo pipefail

REPO="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
CONFIG="${CONFIG_DIR:-$HOME/.config/opencode}"
check=false

for arg in "$@"; do
  case "$arg" in
    --check) check=true ;;
    -h|--help) sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown argument: $arg" >&2; exit 2 ;;
  esac
done

# source|destination-relative-to-config
PAIRS=(
  "$REPO/agents|agents"
  "$REPO/skills|skills"
  "$REPO/config/AGENTS.md|AGENTS.md"
  "$REPO/config/opencode.jsonc|opencode.jsonc"
  "$REPO/config/cli.json|cli.json"
)

fail=0
for pair in "${PAIRS[@]}"; do
  src="${pair%%|*}"
  rel="${pair##*|}"
  dst="$CONFIG/$rel"

  if [[ ! -e $src ]]; then
    echo "FAIL source missing: $src" >&2
    fail=1
    continue
  fi

  if $check; then
    if [[ ! -e $dst && ! -L $dst ]]; then
      echo "MISSING  $rel"
      fail=1
    elif [[ -L $dst && "$(readlink -f "$dst")" == "$(readlink -f "$src")" ]]; then
      echo "ok       $rel"
    else
      echo "DRIFT    $rel (live copy is not a link to $src)"
      fail=1
    fi
    continue
  fi

  if [[ -L $dst ]]; then
    rm "$dst"
  elif [[ -e $dst ]]; then
    mv "$dst" "$dst.bak-$(date +%Y%m%d-%H%M%S)"
    echo "backed up existing $rel"
  fi

  mkdir -p "$(dirname "$dst")"
  ln -s "$src" "$dst"
  echo "linked   $rel -> $src"
done

if $check; then
  exit $fail
fi

echo
echo "OpenCode reads the tracked copies now; service.json is untouched."
