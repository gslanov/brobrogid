#!/bin/bash
# BROBROGID — Daily backup for PostgreSQL
# Install: /usr/local/bin/brobrogid-backup.sh
# Cron:    0 3 * * * root /usr/local/bin/brobrogid-backup.sh

set -e

BACKUP_DIR="/opt/supabase/backups"
CONTAINER="brobrogid-postgres"
DB="brobrogid"
USER="postgres"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/brobrogid_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting backup..."
docker exec "$CONTAINER" pg_dump -U "$USER" -d "$DB" --clean --if-exists | gzip > "$BACKUP_FILE"

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup created: $BACKUP_FILE ($SIZE)"

# Cleanup old backups
find "$BACKUP_DIR" -name "brobrogid_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Cleaned up backups older than $RETENTION_DAYS days"
