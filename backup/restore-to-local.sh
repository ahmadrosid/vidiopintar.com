#!/bin/bash

# Restore SQLite database from backup
# Usage: ./restore-to-local.sh [backup-file]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

DB_PATH="${SQLITE_DATABASE_PATH:-./data/vidiopintar.db}"
BACKUP_FILE="${1:-${SCRIPT_DIR}/data/latest_backup.db}"

if [ ! -f "$BACKUP_FILE" ]; then
  print_error "Backup file not found: $BACKUP_FILE"
  exit 1
fi

print_warning "This will overwrite $DB_PATH with $BACKUP_FILE"
read -p "Proceed? (y/N): " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || { print_info "Cancelled"; exit 0; }

mkdir -p "$(dirname "$DB_PATH")"
cp "$BACKUP_FILE" "$DB_PATH"

if command -v sqlite3 >/dev/null; then
  sqlite3 "$DB_PATH" "PRAGMA integrity_check;"
fi

print_info "Restore completed to $DB_PATH"
