#!/bin/bash

# Database restore script
# Restores a PostgreSQL dump from backup folder

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ../.env ]; then
    print_error "../.env file not found!"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' ../.env | xargs)

# Validate required environment variables
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ]; then
    print_error "Missing required environment variables. Please check your .env file."
    print_error "Required: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME"
    exit 1
fi

# Check backup directory
BACKUP_DIR="./data"
if [ ! -d "$BACKUP_DIR" ]; then
    print_error "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Determine backup file to restore
if [ $# -eq 1 ]; then
    # Use provided backup file
    BACKUP_FILE="$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
elif [ -f "$BACKUP_DIR/latest_backup.dump" ]; then
    # Use latest backup
    BACKUP_FILE="$BACKUP_DIR/latest_backup.dump"
    print_info "Using latest backup file"
else
    print_error "No backup file specified and no latest backup found."
    print_info "Usage: $0 [backup_file]"
    print_info "Available backups:"
    ls -la "$BACKUP_DIR"/*.dump 2>/dev/null || print_warning "No backup files found"
    exit 1
fi

# Build connection string
CONNECTION_STRING="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

print_info "Starting database restore..."
print_info "Database: $DB_NAME"
print_info "Host: $DB_HOST:$DB_PORT"
print_info "User: $DB_USER"
print_info "Backup file: $BACKUP_FILE"

# Check if pg_restore is available
if ! command -v pg_restore &> /dev/null; then
    print_error "pg_restore could not be found. Please install PostgreSQL client tools."
    exit 1
fi

# Warning about destructive operation
print_warning "This will restore the database and may overwrite existing data."
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Restore cancelled."
    exit 0
fi

# Perform the restore
if pg_restore \
    --dbname="$CONNECTION_STRING" \
    --verbose \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    "$BACKUP_FILE"; then
    
    print_info "Restore completed successfully!"
    
else
    print_error "Restore failed!"
    exit 1
fi

print_info "Database restore process completed!"