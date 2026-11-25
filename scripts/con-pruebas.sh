#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
while IFS= read -r linea || [ -n "$linea" ]; do
  case "$linea" in ''|'#'*) continue ;; esac
  export "${linea%%=*}=${linea#*=}"
done < .env.pruebas
exec "$@"
