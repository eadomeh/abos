#!/usr/bin/env bash
set -euo pipefail

required_files=(
  "AGENTS.md"
  ".abos/README.md"
  ".abos/tasks/ABOS-OPS-001.md"
  ".abos/decisions/ADR-0001-multi-agent-control-plane.md"
  ".abos/architecture/control-plane.md"
  ".abos/checklists/change-completion.md"
  ".abos/prompts/builder.md"
  ".abos/prompts/reviewer.md"
  ".abos/prompts/scout.md"
  ".opencode/README.md"
  ".github/pull_request_template.md"
)

for file in "${required_files[@]}"; do
  test -f "$file" || { echo "MISSING: $file"; exit 1; }
done

echo "OPS-001 control-plane files: PASS"

echo "Application source/database changes are intentionally outside this task."
