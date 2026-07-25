#!/usr/bin/env bash
# https://vidiopintar.local — Next.js HTTPS on :443 (no reverse proxy)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CERT="$ROOT/certs/vidiopintar.local.pem"
KEY="$ROOT/certs/vidiopintar.local-key.pem"

if [[ ! -f "$CERT" || ! -f "$KEY" ]]; then
  echo "Certs missing. Run: npm run setup:local"
  exit 1
fi

if lsof -nP -iTCP:443 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port 443 is in use (often k3d/OrbStack)."
  echo "Free it, then retry. Example:"
  echo "  k3d cluster stop nakama-cloud-local"
  exit 1
fi

echo "→ https://vidiopintar.local  (sudo for :443)"
exec sudo npx next dev --turbopack \
  --experimental-https \
  --experimental-https-key "$KEY" \
  --experimental-https-cert "$CERT" \
  --hostname vidiopintar.local \
  --port 443
