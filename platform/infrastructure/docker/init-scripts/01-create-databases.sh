#!/bin/bash
set -e

# Databases to create
DATABASES=(virteex_catalog virteex_inventory virteex_identity virteex_billing virteex_crm virteex_accounting virteex_payroll virteex_projects virteex_manufacturing virteex_treasury virteex_purchasing virteex_bi virteex_admin virteex_fixed_assets virteex_fiscal)

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
