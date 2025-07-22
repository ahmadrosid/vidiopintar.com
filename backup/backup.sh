#!/bin/bash

# Local PostgreSQL backup script (without Docker)
# Usage: ./local-backup.sh [neon|local]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Function to show usage
show_usage() {
    echo "Usage: $0 [neon|local]"
    echo
    echo "Examples:"
    echo "  $0 neon    # Backup from Neon PostgreSQL"
    echo "  $0 local   # Backup from local PostgreSQL server"
    echo "  $0         # Interactive selection"
}

# Function to check if PostgreSQL tools are available
check_pg_tools() {
    if ! command -v pg_dump >/dev/null; then
        print_error "pg_dump not found. Please install PostgreSQL client tools:"
        print_info "  macOS: brew install postgresql"
        print_info "  Ubuntu: sudo apt-get install postgresql-client"
        print_info "  CentOS: sudo yum install postgresql"
        exit 1
    fi

    if ! command -v pg_isready >/dev/null; then
        print_error "pg_isready not found. Please install PostgreSQL client tools."
        exit 1
    fi
}

# Function to select environment
select_environment() {
    if [ $# -eq 1 ]; then
        case "$1" in
            neon|local) ENV="$1" ;;
            *) print_error "Invalid environment: $1"; show_usage; exit 1 ;;
        esac
    else
        echo "Select backup source:"
        echo "1) Neon PostgreSQL"
        echo "2) Local PostgreSQL server"
        read -p "Choose (1-2): " choice
        case $choice in
            1) ENV="neon" ;;
            2) ENV="local" ;;
            *) print_error "Invalid choice"; exit 1 ;;
        esac
    fi
}

# Function to load environment
load_environment() {
    local env_file="../.env.db.$ENV"
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"
        exit 1
    fi
    
    set -a; source "$env_file"; set +a
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
        print_error "Missing required credentials in $env_file"
        exit 1
    fi
    
    print_info "Using $ENV PostgreSQL:"
    print_info "  Host: $DB_HOST"
    print_info "  User: $DB_USER"
    print_info "  Database: $DB_NAME"
    print_info "  Port: ${DB_PORT:-5432}"
}

# Function to check if local PostgreSQL is running
check_local_postgres() {
    if [ "$ENV" = "local" ]; then
        if ! pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
            print_error "Local PostgreSQL server is not running or not accessible"
            print_info "  Host: $DB_HOST"
            print_info "  Port: ${DB_PORT:-5432}"
            print_info "  Database: $DB_NAME"
            print_info "Start PostgreSQL service or check connection settings"
            exit 1
        fi
    fi
}

# Function to create backup
create_backup() {
    mkdir -p ./data
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="db_backup_${ENV}_$timestamp.dump"
    local backup_path="./data/$backup_file"
    
    print_step "Creating backup from $ENV PostgreSQL..."
    print_info "Backup file: $backup_path"
    
    # Set PGPASSWORD environment variable for non-interactive password
    export PGPASSWORD="$DB_PASSWORD"
    
    # For neon env, test connection first
    if [ "$ENV" = "neon" ]; then
        print_info "Testing connection to Neon PostgreSQL..."
        # Extract database name without SSL parameters for pg_isready
        local db_name_clean=$(echo "$DB_NAME" | cut -d'?' -f1)
        if ! pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$db_name_clean" >/dev/null 2>&1; then
            print_warning "pg_isready test failed, but this is common with Neon SSL. Proceeding with backup..."
        fi
    fi
    
    print_step "Running pg_dump..."
    
    # Run pg_dump
    if pg_dump \
        --host="$DB_HOST" \
        --port="${DB_PORT:-5432}" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --format=custom \
        --verbose \
        --no-owner \
        --no-privileges \
        --file="$backup_path"; then
        
        print_info "Backup completed successfully!"
        
        # Create symlink to latest backup
        cd ./data
        ln -sf "$backup_file" "latest_${ENV}_backup.dump"
        ln -sf "$backup_file" "latest_backup.dump"
        cd ..
        
        # Show backup info
        print_info "Backup size: $(du -h "$backup_path" | cut -f1)"
        print_info "Latest backup symlink created: ./data/latest_${ENV}_backup.dump"
        
        # Cleanup old backups (keep last 7 days)
        find ./data -name "db_backup_${ENV}_*.dump" -type f -mtime +7 -delete
        
    else
        print_error "Backup failed!"
        exit 1
    fi
    
    # Unset password
    unset PGPASSWORD
}

# Main function
main() {
    echo "========================================"
    echo "  Local PostgreSQL Backup"
    echo "========================================"
    echo
    
    # Check prerequisites
    check_pg_tools
    
    # Select environment
    select_environment "$@"
    
    # Load environment
    load_environment
    
    # Check local PostgreSQL if needed
    check_local_postgres
    
    # Confirm and create backup
    echo
    print_warning "This will create a backup from $ENV PostgreSQL"
    read -p "Proceed? (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]] || { print_info "Cancelled"; exit 0; }
    
    create_backup
    
    echo
    print_info "$ENV PostgreSQL backup completed!"
}

# Error handling
trap 'print_error "Backup failed at line $LINENO"' ERR

# Run main
main "$@"