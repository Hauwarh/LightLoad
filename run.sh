#!/usr/bin/env bash
# One-shot test: start shop + throttle, run Kane, write reports/run-N.json
exec "$(dirname "$0")/lightload" test
