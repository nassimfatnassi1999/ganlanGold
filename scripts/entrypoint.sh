#!/bin/sh
set -eu

mode="${1:-app}"

require_database_url() {
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is required." >&2
    exit 1
  fi
}

case "$mode" in
  app)
    exec node server.js
    ;;
  migrate)
    require_database_url
    npx prisma migrate deploy
    npm run db:seed
    ;;
  admin-init)
    require_database_url
    npm run admin:init
    ;;
  rates)
    require_database_url
    interval="${RATE_REFRESH_INTERVAL_SECONDS:-86400}"
    case "$interval" in
      *[!0-9]*|'') echo "RATE_REFRESH_INTERVAL_SECONDS must be an integer." >&2; exit 1 ;;
    esac
    if [ "$interval" -lt 300 ]; then
      echo "RATE_REFRESH_INTERVAL_SECONDS must be at least 300." >&2
      exit 1
    fi
    while true; do
      npm run currency:refresh || echo "Currency refresh failed; the last valid rate remains available." >&2
      sleep "$interval"
    done
    ;;
  check)
    require_database_url
    echo "Entrypoint prerequisites are valid."
    ;;
  *)
    echo "Unknown entrypoint mode: $mode" >&2
    exit 64
    ;;
esac
