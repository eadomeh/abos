#!/usr/bin/env bash
set -euo pipefail

fail=0
check_absent() {
  local pattern="$1"
  if grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude='package-lock.json' --exclude='verify-foundation.sh' "$pattern" . >/tmp/abos_check_match 2>/dev/null; then
    echo "FAIL: found forbidden reference: $pattern"
    cat /tmp/abos_check_match
    fail=1
  else
    echo "PASS: absent -> $pattern"
  fi
}

if [[ -d .bolt ]]; then
  echo "FAIL: .bolt directory still exists"
  fail=1
else
  echo "PASS: .bolt directory removed"
fi

check_absent 'https://bolt.new/'
check_absent 'bolt-vite-react-ts'
check_absent 'vite-react-typescript-starter'

if [[ -f .env ]]; then
  echo "FAIL: .env must not ship in the repository snapshot"
  fail=1
else
  echo "PASS: .env absent"
fi

if [[ ! -f .env.example ]]; then
  echo "FAIL: .env.example missing"
  fail=1
else
  echo "PASS: .env.example present"
fi

if [[ ! -f supabase/migrations/20260918000000_009_security_baseline.sql ]]; then
  echo "FAIL: security baseline migration missing"
  fail=1
else
  echo "PASS: security baseline migration present"
fi

if [[ ! -f supabase/functions/whatsapp-webhook/deno.json ]]; then
  echo "FAIL: webhook runtime config missing"
  fail=1
else
  echo "PASS: webhook runtime config present"
fi

if grep -RIn --exclude-dir=node_modules --exclude-dir=.git 'console\.log(.*email\|<p[^>]*>{user?.email\|user\.email' src >/tmp/abos_email_match 2>/dev/null; then
  echo "FAIL: user email is still rendered by the application"
  cat /tmp/abos_email_match
  fail=1
else
  echo "PASS: user email is not rendered in src"
fi

rm -f /tmp/abos_check_match /tmp/abos_email_match

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "ABOS foundation verification: PASS"
