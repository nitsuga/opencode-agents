#!/usr/bin/env bash
# Install this plugin where the host can load it, and wire it into cli.json.
#
# A package install (`opencode plugin add`) does not receive reactive updates —
# see issue #1 — so the working path is a checkout at a stable location, outside
# any dev tree, with its dependencies installed. This script owns that:
#
#   scripts/install.sh                 # clone/update into ~/.local/share/opencode-agents
#   scripts/install.sh --check         # verify the configured install is intact
#   scripts/install.sh --target DIR    # install somewhere else
#   scripts/install.sh --from PATH     # clone from a local path instead of GitHub
#
# Safe to re-run: it fast-forwards the install to origin/main and reinstalls deps.
set -euo pipefail

REPO_URL="${REPO_URL:-git@github.com:nitsuga/opencode-agents.git}"
TARGET="${TARGET:-$HOME/.local/share/opencode-agents}"
PLUGIN="$TARGET/plugin"
CLI_CONFIG="${CLI_CONFIG:-$HOME/.config/opencode/cli.json}"
check_only=false
from=""

while (($#)); do
  case "$1" in
    --target) TARGET="$2"; shift 2 ;;
    --from) from="$2"; shift 2 ;;
    --check) check_only=true; shift ;;
    -h|--help) sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

configured() {
  python3 - "$CLI_CONFIG" <<'PY'
import json, os, sys
path = sys.argv[1]
if not os.path.exists(path):
    print("")
    raise SystemExit
data = json.load(open(path))
for entry in data.get("plugins", []):
    if isinstance(entry, str) and "opencode-native-sidebar" in entry:
        print(entry)
        break
PY
}

if $check_only; then
  status=0
  entry="$(configured)"
  if [[ -z $entry ]]; then
    echo "FAIL: no opencode-native-sidebar entry in $CLI_CONFIG" >&2; status=1
  else
    echo "cli.json entry: $entry"
    if [[ $entry == github:* || $entry == git+* || $entry == opencode-native-sidebar* ]]; then
      echo "WARN: entry is a package spec; package installs do not update reactively (issue #1)" >&2
    elif [[ ! -f $entry/tui.tsx ]]; then
      echo "FAIL: $entry/tui.tsx missing" >&2; status=1
    elif [[ ! -d $entry/node_modules/solid-js ]]; then
      echo "FAIL: dependencies missing in $entry (run scripts/install.sh)" >&2; status=1
    else
      echo "OK: checkout present, dependencies installed"
      git -C "$entry" rev-parse --short HEAD 2>/dev/null | sed 's/^/commit: /' || true
    fi
  fi
  exit $status
fi

# Fetch or refresh the install.
if [[ -d $TARGET/.git ]]; then
  echo "updating $TARGET"
  if [[ -n $(git -C "$TARGET" status --porcelain) ]]; then
    echo "refusing to touch a dirty checkout: $TARGET" >&2
    echo "commit or stash those changes first (it is probably a dev tree — use a separate --target)" >&2
    exit 1
  fi
  git -C "$TARGET" fetch -q origin
  git -C "$TARGET" reset -q --hard origin/main
else
  echo "cloning into $TARGET"
  mkdir -p "$(dirname "$TARGET")"
  git clone -q "${from:-$REPO_URL}" "$TARGET"
  [[ -z $from ]] || git -C "$TARGET" remote set-url origin "$REPO_URL"
fi

if [[ ! -f $PLUGIN/tui.tsx ]]; then
  echo "plugin/tui.tsx is missing in $TARGET — is that really this repo?" >&2
  exit 1
fi

echo "installing dependencies"
(cd "$PLUGIN" && npm ci --omit=dev --no-audit --no-fund >/dev/null)

# Point cli.json at the checkout, replacing any other entry for this plugin.
python3 - "$CLI_CONFIG" "$PLUGIN" <<'PY'
import collections, json, os, sys
config, target = sys.argv[1], os.path.realpath(sys.argv[2])
data = collections.OrderedDict()
if os.path.exists(config):
    data = json.load(open(config), object_pairs_hook=collections.OrderedDict)
plugins = [
    entry for entry in data.get("plugins", [])
    if not (isinstance(entry, str) and "opencode-native-sidebar" in entry)
]
plugins.append(target)
data["plugins"] = plugins
os.makedirs(os.path.dirname(config), exist_ok=True)
open(config, "w").write(json.dumps(data, indent=2) + "\n")
print("cli.json plugins:", plugins)
PY

echo "installed $(git -C "$TARGET" rev-parse --short HEAD) at $PLUGIN"
echo "restart the TUI to pick it up (ctrl+c, then opencode); sidebar toggles with ctrl+x b"
