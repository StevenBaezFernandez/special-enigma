#!/bin/bash
set -e

# Databases to create
DATABASES=(virteex_catalog virteex_inventory virteex_identity virteex_billing virteex_crm virteex_accounting)

for db in "${DATABASES[@]}"; do
  echo "Checking if database '$db' exists..."
  if ! psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" -lqt | cut -d \| -f 1 | grep -qw "$db"; then
    echo "Creating database '$db'..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
      CREATE DATABASE "$db";
      GRANT ALL PRIVILEGES ON DATABASE "$db" TO "$POSTGRES_USER";
EOSQL
  else
    echo "Database '$db' already exists."
  fi
done
