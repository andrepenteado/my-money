#!/usr/bin/env bash
set -euo pipefail
# Cada execução usa um banco descartável; o banco de desenvolvimento é preservado.
container_id=$(docker run --rm -d -p 127.0.0.1::5432 -e POSTGRES_DB=my_money_test -e POSTGRES_USER=my_money_test -e POSTGRES_PASSWORD=test_local postgres:18-alpine)
trap 'docker stop "$container_id" >/dev/null' EXIT
ready=false
for attempt in {1..60}; do
  if docker exec "$container_id" pg_isready -h 127.0.0.1 -U my_money_test -d my_money_test >/dev/null 2>&1; then ready=true; break; fi
  sleep 1
done
if [[ "$ready" != true ]]; then echo 'O PostgreSQL de testes não iniciou.' >&2; exit 1; fi
port=$(docker port "$container_id" 5432/tcp)
export DATABASE_URL="jdbc:postgresql://127.0.0.1:${port##*:}/my_money_test"
export DATABASE_USER=my_money_test
export DATABASE_PASSWORD=test_local
cd backend
"${GRADLE:-gradle}" "$@"
