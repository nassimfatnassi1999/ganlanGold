#!/bin/sh
set -eu

dry_run=false
confirmed=false

case "${1:-}" in
  --dry-run) dry_run=true; shift ;;
  --confirm-restore) confirmed=true; shift ;;
esac

input="${1:-}"
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi
if [ -z "$input" ]; then
  echo "Usage: restore.sh --dry-run BACKUP.dump" >&2
  echo "   or: restore.sh --confirm-restore BACKUP.dump" >&2
  exit 64
fi

if [ "$dry_run" = true ]; then
  echo "Dry run: restore prerequisites are valid; no database command was executed."
  echo "Source: $input"
  exit 0
fi

if [ "$confirmed" != true ]; then
  echo "Restore is destructive. Re-run with --confirm-restore BACKUP.dump." >&2
  exit 64
fi
if [ ! -r "$input" ]; then
  echo "Backup is not readable: $input" >&2
  exit 1
fi

pg_restore --clean --if-exists --no-owner --no-privileges --exit-on-error --dbname="$DATABASE_URL" "$input"
echo "Restore completed from $input"
