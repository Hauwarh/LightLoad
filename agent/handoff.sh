#!/usr/bin/env bash
# LIGHTLOAD_AGENT=custom bridge for an AI agent that works through files instead of a CLI
# (used for the hackathon run with Grok Bot). Reads the auto-built prompt on stdin, publishes it
# to agent/inbox/prompt.md, then blocks until the agent writes agent/last-fix.txt (max 40 min).
set -euo pipefail
mkdir -p agent/inbox
cat > agent/inbox/prompt.md
echo "handoff: prompt published to agent/inbox/prompt.md at $(date -u +%FT%TZ), waiting for agent"
for _ in $(seq 1 2400); do
  [[ -s agent/last-fix.txt ]] && { echo "handoff: agent finished at $(date -u +%FT%TZ): $(head -1 agent/last-fix.txt)"; exit 0; }
  sleep 1
done
echo "handoff: timed out waiting for agent" >&2; exit 1
