#!/usr/bin/env bash
# Harness self-test without Kane credits or an agent: copies the repo to a temp dir and runs the
# full loop with the stand-in Kane (test/fake-kane.js) and a scripted fixer (test/scripted-agent.py)
# on a fast network preset. Checks plumbing only; the real proof comes from ./lightload loop with Kane.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
cp -r "$SRC/." "$TMP/" && cd "$TMP"
[[ -d .git ]] || { git init -q; git add -A; git -c user.name=t -c user.email=t@t commit -qm base; git tag heavy-baseline; }
git config user.name selftest; git config user.email selftest@example.com
mkdir -p reports.bak && find reports -maxdepth 1 -name 'run-*' -exec mv {} reports.bak/ \;
node -e "const f='lightload.config.json',c=require('./'+f);c.presets.fast={down_kbps:20000,latency_ms:20};require('fs').writeFileSync(f,JSON.stringify(c,null,2))"
git add -A && git commit -qm "selftest setup"
LIGHTLOAD_NETWORK=fast KANE_BIN="$TMP/test/fake-kane.js" LIGHTLOAD_AGENT=custom LIGHTLOAD_AGENT_CMD="python3 test/scripted-agent.py" ./loop.sh
echo; git log --oneline | head -6; echo "selftest dir: $TMP"
