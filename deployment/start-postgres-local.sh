#!/bin/bash

# Start PostgreSQL local server (without Docker)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to detect PostgreSQL installation
detect_postgres() {
    if command -v pg_ctl >/dev/null; then
        PG_CTL_PATH=$(command -v pg_ctl)
        POSTGRES_PATH=$(command -v postgres)
        print_info "Found PostgreSQL at: $POSTGRES_PATH"
        return 0
    fi
    
    # Common PostgreSQL installation paths
    local common_paths=(
        "/usr/local/bin/pg_ctl"
        "/usr/bin/pg_ctl"
        "/opt/homebrew/bin/pg_ctl"
        "/usr/local/pgsql/bin/pg_ctl"
    )
    
    for path in "${common_paths[@]}"; do
        if [ -f "$path" ]; then
            PG_CTL_PATH="$path"
            POSTGRES_PATH="${path/pg_ctl/postgres}"
            print_info "Found PostgreSQL at: $POSTGRES_PATH"
            return 0
        fi
    done
    
    return 1
}

# Function to show installation instructions
show_install_instructions() {
    print_error "PostgreSQL is not installed or not in PATH"
    print_info "Install PostgreSQL:"
    print_info "  macOS: brew install postgresql"
    print_info "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    print_info "  CentOS: sudo yum install postgresql-server postgresql-contrib"
    print_info "  Arch: sudo pacman -S postgresql"
    exit 1
}

# Function to check if PostgreSQL is already running
check_postgres_running() {
    if [ -f "$PGDATA/postmaster.pid" ]; then
        local pid=$(head -1 "$PGDATA/postmaster.pid" 2>/dev/null)
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            print_warning "PostgreSQL is already running (PID: $pid)"
            print_info "Data directory: $PGDATA"
            print_info "Port: ${DB_PORT:-5432}"
            print_info "Connection: postgresql://$DB_USER:***@localhost:${DB_PORT:-5432}/$DB_NAME"
            return 0
        else
            # Clean up stale pid file
            rm -f "$PGDATA/postmaster.pid"
        fi
    fi
    return 1
}

# Function to initialize PostgreSQL data directory
init_postgres() {
    if [ ! -d "$PGDATA" ] || [ ! -f "$PGDATA/PG_VERSION" ]; then
        print_info "Initializing PostgreSQL data directory..."
        mkdir -p "$PGDATA"
        
        if ! "$PG_CTL_PATH" init -D "$PGDATA" -s; then
            print_error "Failed to initialize PostgreSQL data directory"
            exit 1
        fi
        
        print_info "PostgreSQL data directory initialized"
    fi
}

# Function to start PostgreSQL
start_postgres() {
    print_info "Starting PostgreSQL server..."
    
    # Start PostgreSQL
    if "$PG_CTL_PATH" start -D "$PGDATA" -l "$PGDATA/postgresql.log" -s; then
        print_info "PostgreSQL server started successfully"
    else
        print_error "Failed to start PostgreSQL server"
        print_info "Check logs: $PGDATA/postgresql.log"
        exit 1
    fi
    
    # Wait for PostgreSQL to be ready
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if pg_isready -h localhost -p "${DB_PORT:-5432}" >/dev/null 2>&1; then
            print_info "PostgreSQL is ready!"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "PostgreSQL failed to start within $max_attempts seconds"
        print_info "Check logs: $PGDATA/postgresql.log"
        exit 1
    fi
}

# Function to create database and user
setup_database() {
    print_info "Setting up database and user..."
    
    # Check if database user exists
    if ! psql -h localhost -p "${DB_PORT:-5432}" -U "$USER" -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null | grep -q 1; then
        print_info "Creating database user: $DB_USER"
        psql -h localhost -p "${DB_PORT:-5432}" -U "$USER" -d postgres -c "CREATE USER \"$DB_USER\" WITH CREATEDB LOGIN PASSWORD '$DB_PASSWORD';" >/dev/null
    fi
    
    # Check if database exists
    if ! psql -h localhost -p "${DB_PORT:-5432}" -U "$USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_info "Creating database: $DB_NAME"
        psql -h localhost -p "${DB_PORT:-5432}" -U "$USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";" >/dev/null
    fi
    
    print_info "Database setup completed"
}

# Main function
main() {
    echo "========================================"
    echo "  Local PostgreSQL Server Startup"
    echo "========================================"
    echo
    
    # Check if .env file exists
    if [ ! -f ../.env.db.local ]; then
        print_error ".env.db.local file not found in parent directory!"
        print_info "Please create .env.db.local with database configuration"
        exit 1
    fi
    
    # Load environment variables
    set -a
    source ../.env.db.local
    set +a
    
    # Validate required variables
    if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
        print_error "Missing required environment variables in .env.db.local"
        print_info "Required: DB_USER, DB_PASSWORD, DB_NAME"
        exit 1
    fi
    
    # Set default data directory
    export PGDATA="${PGDATA:-$HOME/.postgres-data}"
    
    print_info "Configuration:"
    print_info "  Database: $DB_NAME"
    print_info "  User: $DB_USER"
    print_info "  Port: ${DB_PORT:-5432}"
    print_info "  Data directory: $PGDATA"
    
    # Detect PostgreSQL installation
    if ! detect_postgres; then
        show_install_instructions
    fi
    
    # Check if PostgreSQL is already running
    if check_postgres_running; then
        exit 0
    fi
    
    # Initialize PostgreSQL data directory
    init_postgres
    
    # Start PostgreSQL
    start_postgres
    
    # Setup database and user
    setup_database
    
    echo
    print_info "PostgreSQL is running at localhost:${DB_PORT:-5432}"
    print_info "Connection string: postgresql://$DB_USER:***@localhost:${DB_PORT:-5432}/$DB_NAME"
    print_info "Data directory: $PGDATA"
    print_info "Log file: $PGDATA/postgresql.log"
    
    print_info "To stop PostgreSQL: pg_ctl stop -D $PGDATA"
    print_info "To connect: psql -h localhost -p ${DB_PORT:-5432} -U $DB_USER -d $DB_NAME"
}

# Error handling
trap 'print_error "Failed to start PostgreSQL at line $LINENO"' ERR

# Run main
main "$@"