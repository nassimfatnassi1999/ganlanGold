#!/bin/sh
set -eu

dry_run=false
if [ "${1:-}" = "--dry-run" ]; then
  dry_run=true
  shift
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

backup_dir="${BACKUP_DIR:-/backups}"
target="${1:-$backup_dir/ganlan-gold-$(date -u +%Y%m%dT%H%M%SZ).dump}"

if [ "$dry_run" = true ]; then
  echo "Dry run: backup prerequisites are valid; no database command was executed."
  echo "Target: $target"
  exit 0
fi

mkdir -p "$backup_dir"
if [ -e "$target" ]; then
  echo "Refusing to overwrite existing backup: $target" >&2
  exit 1
fi

temporary="$target.partial"
trap 'rm -f "$temporary"' EXIT HUP INT TERM
pg_dump --format=custom --no-owner --no-privileges --file="$temporary" "$DATABASE_URL"
mv "$temporary" "$target"
trap - EXIT HUP INT TERM
echo "Backup written to $target"
