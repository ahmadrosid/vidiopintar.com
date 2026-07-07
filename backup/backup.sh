#!/bin/bash

# SQLite database backup script
# Usage: ./backup.sh

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

if [ ! -f "$DB_PATH" ]; then
  print_error "SQLite database not found: $DB_PATH"
  exit 1
fi

if ! command -v sqlite3 >/dev/null; then
  print_error "sqlite3 not found. Install it with: brew install sqlite"
  exit 1
fi

mkdir -p "${SCRIPT_DIR}/data"

timestamp=$(date +"%Y%m%d_%H%M%S")
backup_file="db_backup_sqlite_${timestamp}.db"
backup_path="${SCRIPT_DIR}/data/${backup_file}"

print_info "Backing up SQLite database..."
print_info "Source: $DB_PATH"
print_info "Destination: $backup_path"

sqlite3 "$DB_PATH" ".backup '${backup_path}'"

cd "${SCRIPT_DIR}/data"
ln -sf "$backup_file" "latest_sqlite_backup.db"
ln -sf "$backup_file" "latest_backup.db"
cd - >/dev/null

print_info "Backup size: $(du -h "$backup_path" | cut -f1)"
find "${SCRIPT_DIR}/data" -name "db_backup_sqlite_*.db" -type f -mtime +7 -delete
print_info "SQLite backup completed!"
