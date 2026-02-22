#!/bin/sh
set -e

if [ -n "$ADMIN_USERNAME" ] && [ -n "$ADMIN_PASSWORD" ]; then
    echo "Creating admin user '$ADMIN_USERNAME'..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        INSERT INTO admins (username, password_hash, display_name) 
        VALUES ('$ADMIN_USERNAME', crypt('$ADMIN_PASSWORD', gen_salt('bf')), 'Admin')
        ON CONFLICT (username) DO NOTHING;
EOSQL
    echo "Admin user created successfully."
else
    echo "Warning: ADMIN_USERNAME or ADMIN_PASSWORD not provided in environment. Skipping admin creation."
fi
