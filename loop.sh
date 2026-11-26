#!/usr/bin/env bash
# Kane test -> agent fix -> Kane re-test, up to max_rounds fixes. Stops as soon as Kane passes.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
max=$(node -e "process.stdout.write(String(require('./lightload.config.json').max_rounds))")
git diff --quiet -- demo-shop || { echo "loop: demo-shop has uncommitted changes. Commit or ./lightload reset first." >&2; exit 2; }

first=""
for round in $(seq 0 "$max"); do
  ./lightload test; status=$?
  n=$(ls reports/run-*.json | sed -E 's/.*run-([0-9]+)\.json/\1/' | sort -n | tail -1)
  [[ -z "$first" ]] && first=$n
  [[ $status -eq 2 ]] && { echo "loop: test harness error, stopping." >&2; exit 2; }
  if [[ $status -eq 0 ]]; then
    git add reports && git commit -q -m "test: Kane run #$n passed ($(node -e "const r=require('./reports/run-$n.json');process.stdout.write(r.seconds+'s, '+r.mb+'MB')"))" || true
    echo "loop: Kane passed on run #$n after $round fix round(s)."
    ./lightload card "$first" "$n" && git add card && git commit -q -m "docs: before/after card for runs #$first and #$n" || true
    exit 0
  fi
  if [[ $round -eq $max ]]; then break; fi
  echo "loop: fix round $((round + 1)) of $max"
  ./lightload fix || echo "loop: fix round $((round + 1)) made no change"
done
git add reports && git commit -q -m "test: Kane run #$n still failing after $max fix rounds" || true
./lightload card "$first" "$n" || true
echo "loop: still failing after $max fix rounds. See reports/run-$n.json" >&2
exit 1
