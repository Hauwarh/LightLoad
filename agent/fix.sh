#!/usr/bin/env bash
# Hands the latest failed Kane run to an AI coding agent, then commits its fix with the Kane run cited.
# No human copy-paste: the prompt is built from reports/run-N.json, reports/run-N.ndjson and the
# proxy's per-file byte breakdown, and passed straight to the agent CLI.
#
# Agent selection (LIGHTLOAD_AGENT): claude (default if installed) | cursor | codex | custom
#   custom: set LIGHTLOAD_AGENT_CMD to a command that reads the prompt on stdin.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

latest=$(ls reports/run-*.json 2>/dev/null | sed -E 's/.*run-([0-9]+)\.json/\1/' | sort -n | tail -1 || true)
[[ -n "$latest" ]] || { echo "fix: no Kane report yet. Run ./lightload test first." >&2; exit 2; }
R="reports/run-$latest.json"
verdict=$(node -e "process.stdout.write(require('./$R').verdict)")
if [[ "$verdict" == "pass" ]]; then echo "fix: Kane run #$latest already passed, nothing to fix."; exit 0; fi

mkdir -p agent/prompts agent/transcripts
PROMPT="agent/prompts/run-$latest.md"
rm -f agent/last-fix.txt
node agent/build-prompt.js "$latest" > "$PROMPT"
echo "fix: prompt for Kane run #$latest written to $PROMPT"

agent="${LIGHTLOAD_AGENT:-}"
if [[ -z "$agent" ]]; then
  if command -v claude >/dev/null; then agent=claude
  elif command -v cursor-agent >/dev/null; then agent=cursor
  elif command -v codex >/dev/null; then agent=codex
  else echo "fix: no agent CLI found (claude, cursor-agent, codex). Set LIGHTLOAD_AGENT_CMD and LIGHTLOAD_AGENT=custom." >&2; exit 2; fi
fi
before=$(git rev-parse HEAD)
# Keep a private copy of this run's evidence so the agent cannot rewrite it.
mkdir -p .lightload/evidence && cp reports/run-"$latest".* .lightload/evidence/
T="agent/transcripts/run-$latest.txt"
echo "fix: running agent '$agent' (transcript: $T)"
case "$agent" in
  claude) claude -p "$(cat "$PROMPT")" --permission-mode acceptEdits --allowedTools "Read,Edit,Write,Glob,Grep,Bash" > "$T" 2>&1 ;;
  cursor) cursor-agent -p --force "$(cat "$PROMPT")" > "$T" 2>&1 ;;
  codex)  codex exec --full-auto "$(cat "$PROMPT")" > "$T" 2>&1 ;;
  custom) bash -c "${LIGHTLOAD_AGENT_CMD:?set LIGHTLOAD_AGENT_CMD}" < "$PROMPT" > "$T" 2>&1 ;;
  *) echo "fix: unknown LIGHTLOAD_AGENT '$agent'" >&2; exit 2 ;;
esac || { echo "fix: agent exited with an error, see $T" >&2; }

# Guardrail: the agent may only change demo-shop/. Anything it touched in the harness is reverted,
# so it cannot pass by editing the proxy, the budgets or the reports.
git reset -q HEAD 2>/dev/null || true
if [[ "$(git rev-parse HEAD)" != "$before" ]]; then
  echo "fix: agent made its own commits; folding them into one LightLoad fix commit" >&2
  git reset -q --soft "$before"; git reset -q
fi
reverted=""
while read -r f; do
  [[ -z "$f" ]] && continue
  case "$f" in demo-shop/*|agent/last-fix.txt) ;; *) git checkout -q -- "$f" 2>/dev/null && reverted+=" $f" ;; esac
done < <(git diff --name-only)
cp .lightload/evidence/run-"$latest".* reports/
[[ -n "$reverted" ]] && echo "fix: reverted agent edits outside demo-shop/:$reverted"

changed=$(git status --porcelain -- demo-shop | wc -l | tr -d ' ')
summary=$(head -1 agent/last-fix.txt 2>/dev/null | tr -d '\r' | cut -c1-90 || true)
[[ -n "$summary" ]] || summary="slim demo-shop"
nums=$(node -e "const r=require('./$R'); process.stdout.write(r.seconds+'s, '+r.mb+'MB, ₦'+r.naira.toFixed(2))")

{
  echo ""
  echo "## Fix after Kane run #$latest ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  echo ""
  echo "- Kane run #$latest: **FAIL** ($nums). $(node -e "process.stdout.write(require('./$R').failures.join('; '))")"
  echo "- Agent: \`$agent\`, prompt: \`$PROMPT\`, transcript: \`$T\`"
  echo "- Agent summary: $summary"
  [[ -n "$reverted" ]] && echo "- Reverted out-of-scope edits:$reverted"
  echo ""
  echo '```'
  git add -A demo-shop
  git diff --cached --stat -- demo-shop | tail -25
  echo '```'
} >> agent/log.md

if [[ "$changed" == "0" ]]; then
  echo "fix: agent changed nothing in demo-shop/." >&2
  git add agent reports && git commit -q -m "chore: agent made no change after Kane run #$latest" || true
  exit 1
fi
git add -A demo-shop agent reports
git commit -q -m "fix: $summary (Kane run #$latest failed: $nums)" -m "Kane report: $R
Kane NDJSON: reports/run-$latest.ndjson
Agent: $agent, prompt $PROMPT"
echo "fix: committed $(git rev-parse --short HEAD): fix: $summary (Kane run #$latest failed: $nums)"
