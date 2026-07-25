#!/usr/bin/env bash
# One-time setup for https://vidiopintar.local
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "Missing mkcert. Install: brew install mkcert"
  exit 1
fi

echo "→ Trusting local CA (password prompt)…"
mkcert -install

echo "→ Generating certs…"
mkdir -p certs
cd certs
if [[ ! -f vidiopintar.local.pem ]]; then
  mkcert -cert-file vidiopintar.local.pem -key-file vidiopintar.local-key.pem \
    vidiopintar.local localhost 127.0.0.1 ::1
else
  echo "  certs already exist, skipping"
fi
cd "$ROOT"

echo "→ Adding /etc/hosts entry…"
if grep -qE '[[:space:]]vidiopintar\.local([[:space:]]|$)' /etc/hosts; then
  echo "  already present"
else
  echo '127.0.0.1 vidiopintar.local' | sudo tee -a /etc/hosts >/dev/null
  echo "  added"
fi

if [[ -f .env ]]; then
  if grep -q '^NEXT_PUBLIC_SITE_URL=' .env; then
    sed -i.bak 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://vidiopintar.local|' .env
    rm -f .env.bak
  else
    echo 'NEXT_PUBLIC_SITE_URL=https://vidiopintar.local' >> .env
  fi
  echo "→ Updated NEXT_PUBLIC_SITE_URL in .env"
fi

cat <<'EOF'

Done.

Clerk (Development instance, pk_test_):
1. Open https://dashboard.clerk.com → your app → Development
2. Configure → Paths
   - Ensure sign-in/sign-up paths match .env (/sign-in, /sign-up)
3. If you see origin / CORS errors in the browser console:
   Configure → Settings (or Domains) and allow:
   https://vidiopintar.local
4. Restart: npm run dev:local
5. Open https://vidiopintar.local/sign-in

Note: Development instances are permissive for most local hosts.
      Production (pk_live_) cannot use .local — use a real subdomain instead.

EOF
